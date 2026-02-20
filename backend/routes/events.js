const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { verifyUserToken } = require('../middleware/roleAuth');
const notificationService = require('../services/notificationService');
const activityService = require('../services/activityService');

// GET /api/events - Get all events (filterable)
router.get('/', verifyUserToken, async (req, res) => {
    try {
        const { startDate, endDate, eventType } = req.query;

        let query = {};

        // Filter by date range
        if (startDate || endDate) {
            query.eventDate = {};
            if (startDate) query.eventDate.$gte = new Date(startDate);
            if (endDate) query.eventDate.$lte = new Date(endDate);
        }

        // Filter by event type
        if (eventType) {
            query.eventType = eventType;
        }

        // Only show public events or events user is invited to
        query.$or = [
            { isPublic: true },
            { attendees: req.user._id }
        ];

        const events = await Event.find(query)
            .sort({ eventDate: 1 })
            .populate('createdBy', 'username email')
            .populate('attendees', 'fullName email');

        res.json({
            success: true,
            events
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// GET /api/events/upcoming - Get upcoming events
router.get('/upcoming', verifyUserToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        const events = await Event.find({
            eventDate: { $gte: new Date() },
            $or: [
                { isPublic: true },
                { attendees: req.user._id }
            ]
        })
            .sort({ eventDate: 1 })
            .limit(limit)
            .populate('createdBy', 'username email');

        res.json({
            success: true,
            events
        });
    } catch (error) {
        console.error('Get upcoming events error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// GET /api/events/:id - Get event details
router.get('/:id', verifyUserToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'username email')
            .populate('attendees', 'fullName email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check access
        if (!event.isPublic && !event.attendees.some(a => a._id.toString() === req.user._id.toString())) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this event'
            });
        }

        res.json({
            success: true,
            event
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// POST /api/events - Create event (admin only)
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, eventDate, eventTime, location, eventType, attendees, isPublic } = req.body;

        if (!title || !eventDate) {
            return res.status(400).json({
                success: false,
                message: 'Title and event date are required'
            });
        }

        const event = new Event({
            title,
            description,
            eventDate,
            eventTime,
            location,
            eventType: eventType || 'meeting',
            createdBy: req.admin.id,
            attendees: attendees || [],
            isPublic: isPublic !== false
        });

        await event.save();

        // Notify all users if public, or just attendees if private
        if (event.isPublic) {
            const users = await User.find({ isActive: true });
            const userIds = users.map(u => u._id);
            await notificationService.notifyEventCreated(event, userIds);
        } else if (attendees && attendees.length > 0) {
            await notificationService.notifyEventCreated(event, attendees);
        }

        // Log activity
        activityService.logActivity(
            req.admin.id,
            'event_created',
            'event',
            event._id,
            `Created event: ${event.title}`,
            { eventType: event.eventType, eventDate: event.eventDate, isPublic: event.isPublic },
            req.ip
        ).catch(err => {
            console.error('Failed to log activity:', err);
        });

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// PUT /api/events/:id - Update event (admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, description, eventDate, eventTime, location, eventType, attendees, isPublic } = req.body;

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        if (title) event.title = title;
        if (description !== undefined) event.description = description;
        if (eventDate) event.eventDate = eventDate;
        if (eventTime !== undefined) event.eventTime = eventTime;
        if (location !== undefined) event.location = location;
        if (eventType) event.eventType = eventType;
        if (attendees) event.attendees = attendees;
        if (isPublic !== undefined) event.isPublic = isPublic;

        await event.save();

        // Notify attendees about update
        if (event.isPublic) {
            const users = await User.find({ isActive: true });
            const userIds = users.map(u => u._id);
            await notificationService.notifyEventUpdated(event, userIds);
        } else if (event.attendees && event.attendees.length > 0) {
            await notificationService.notifyEventUpdated(event, event.attendees);
        }

        // Log activity
        activityService.logActivity(
            req.admin.id,
            'event_updated',
            'event',
            event._id,
            `Updated event: ${event.title}`,
            { eventType: event.eventType, eventDate: event.eventDate },
            req.ip
        ).catch(err => {
            console.error('Failed to log activity:', err);
        });

        res.json({
            success: true,
            message: 'Event updated successfully',
            event
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// DELETE /api/events/:id - Delete event (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Log activity
        activityService.logActivity(
            req.admin.id,
            'event_deleted',
            'event',
            event._id,
            `Deleted event: ${event.title}`,
            { eventType: event.eventType, eventDate: event.eventDate },
            req.ip
        ).catch(err => {
            console.error('Failed to log activity:', err);
        });

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
