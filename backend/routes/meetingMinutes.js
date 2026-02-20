const express = require('express');
const router = express.Router();
const MeetingMinutes = require('../models/MeetingMinutes');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { verifyUserToken, checkPermissions } = require('../middleware/roleAuth');
const upload = require('../middleware/upload');
const notificationService = require('../services/notificationService');

// GET /api/meeting-minutes - Get all published minutes (paginated, searchable)
router.get('/', verifyUserToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        let query = { isPublished: true };

        // Search by title or content
        if (search) {
            query.$text = { $search: search };
        }

        const minutes = await MeetingMinutes.find(query)
            .sort({ meetingDate: -1 })
            .skip(skip)
            .limit(limit)
            .populate('attendees', 'fullName email')
            .populate('uploadedBy', 'username email');

        const total = await MeetingMinutes.countDocuments(query);

        res.json({
            success: true,
            minutes,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Get meeting minutes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// GET /api/meeting-minutes/:id - Get specific meeting minutes
router.get('/:id', verifyUserToken, async (req, res) => {
    try {
        const minutes = await MeetingMinutes.findById(req.params.id)
            .populate('attendees', 'fullName email')
            .populate('uploadedBy', 'username email');

        if (!minutes) {
            return res.status(404).json({
                success: false,
                message: 'Meeting minutes not found'
            });
        }

        if (!minutes.isPublished) {
            return res.status(403).json({
                success: false,
                message: 'These minutes are not published yet'
            });
        }

        res.json({
            success: true,
            minutes
        });
    } catch (error) {
        console.error('Get meeting minutes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// POST /api/meeting-minutes - Upload meeting minutes (admin/secretary only)
router.post('/', auth, upload.array('attachments', 5), async (req, res) => {
    try {
        const { title, meetingDate, attendees, summary, content, isPublished } = req.body;

        if (!title || !meetingDate || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title, meeting date, and content are required'
            });
        }

        // Process uploaded files
        const attachments = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                attachments.push({
                    filename: file.filename,
                    originalName: file.originalname,
                    path: file.path,
                    size: file.size,
                    mimetype: file.mimetype
                });
            });
        }

        const minutes = new MeetingMinutes({
            title,
            meetingDate,
            attendees: attendees ? JSON.parse(attendees) : [],
            summary,
            content,
            attachments,
            uploadedBy: req.admin.id,
            isPublished: isPublished !== 'false'
        });

        await minutes.save();

        // Notify all users if published
        if (minutes.isPublished) {
            const users = await User.find({ isActive: true });
            const userIds = users.map(u => u._id);
            await notificationService.notifyMeetingUploaded(minutes, userIds);
        }

        res.status(201).json({
            success: true,
            message: 'Meeting minutes uploaded successfully',
            minutes
        });
    } catch (error) {
        console.error('Upload meeting minutes error:', error);

        // Clean up uploaded files if there was an error
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// PUT /api/meeting-minutes/:id - Update meeting minutes (admin/secretary only)
router.put('/:id', auth, upload.array('attachments', 5), async (req, res) => {
    try {
        const { title, meetingDate, attendees, summary, content, isPublished } = req.body;

        const minutes = await MeetingMinutes.findById(req.params.id);

        if (!minutes) {
            return res.status(404).json({
                success: false,
                message: 'Meeting minutes not found'
            });
        }

        // Update fields
        if (title) minutes.title = title;
        if (meetingDate) minutes.meetingDate = meetingDate;
        if (attendees) minutes.attendees = JSON.parse(attendees);
        if (summary !== undefined) minutes.summary = summary;
        if (content) minutes.content = content;
        if (isPublished !== undefined) minutes.isPublished = isPublished !== 'false';

        // Add new attachments
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                minutes.attachments.push({
                    filename: file.filename,
                    originalName: file.originalname,
                    path: file.path,
                    size: file.size,
                    mimetype: file.mimetype
                });
            });
        }

        await minutes.save();

        res.json({
            success: true,
            message: 'Meeting minutes updated successfully',
            minutes
        });
    } catch (error) {
        console.error('Update meeting minutes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// DELETE /api/meeting-minutes/:id - Delete meeting minutes (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const minutes = await MeetingMinutes.findById(req.params.id);

        if (!minutes) {
            return res.status(404).json({
                success: false,
                message: 'Meeting minutes not found'
            });
        }

        // Delete associated files
        if (minutes.attachments && minutes.attachments.length > 0) {
            minutes.attachments.forEach(attachment => {
                fs.unlink(attachment.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        }

        await minutes.deleteOne();

        res.json({
            success: true,
            message: 'Meeting minutes deleted successfully'
        });
    } catch (error) {
        console.error('Delete meeting minutes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// GET /api/meeting-minutes/:id/download/:fileIndex - Download attachment
router.get('/:id/download/:fileIndex', verifyUserToken, async (req, res) => {
    try {
        const { id, fileIndex } = req.params;

        const minutes = await MeetingMinutes.findById(id);

        if (!minutes || !minutes.isPublished) {
            return res.status(404).json({
                success: false,
                message: 'Meeting minutes not found'
            });
        }

        const index = parseInt(fileIndex);
        if (isNaN(index) || index < 0 || index >= minutes.attachments.length) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        const attachment = minutes.attachments[index];
        const filePath = path.resolve(attachment.path);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }

        res.download(filePath, attachment.originalName);
    } catch (error) {
        console.error('Download file error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
