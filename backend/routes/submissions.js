const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Registration = require('../models/Registration');
const auth = require('../middleware/auth');
const { sendConfirmationEmail, sendAdminNotification, sendStatusUpdateEmail } = require('../utils/email');
const activityService = require('../services/activityService');

// Validation rules
const registrationValidation = [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('gender').isIn(['male', 'female']).withMessage('Invalid gender'),
    body('ageRange').notEmpty().withMessage('Age is required'),
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('isMember').isBoolean().withMessage('Member status is required'),
    body('hasExperience').isBoolean().withMessage('Experience status is required'),
    body('availability').optional().isString().withMessage('Availability must be a string'),
    body('commitment').trim().notEmpty().withMessage('Commitment is required'),
    body('emergencyContactName').trim().notEmpty().withMessage('Emergency contact name is required'),
    body('emergencyContactRelationship').trim().notEmpty().withMessage('Emergency relationship is required'),
    body('emergencyContactPhone').trim().notEmpty().withMessage('Emergency phone is required')
];

// POST - Submit new registration
router.post('/', registrationValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        // Create new registration
        const registration = new Registration(req.body);
        await registration.save();

        // Send confirmation email to applicant (don't wait for it to complete)
        sendConfirmationEmail(registration).catch(err => {
            console.error('Failed to send confirmation email:', err);
        });

        // Send notification email to admin (don't wait for it to complete)
        sendAdminNotification(registration).catch(err => {
            console.error('Failed to send admin notification:', err);
        });

        res.status(201).json({
            success: true,
            message: 'Registration submitted successfully! A confirmation email has been sent to your email address.',
            data: registration
        });
    } catch (error) {
        console.error('Error submitting registration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit registration',
            error: error.message
        });
    }
});

// GET - Retrieve all registrations (protected, admin only)
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = '', sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) {
            query.status = status;
        }

        // Build sort object
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const registrations = await Registration.find(query)
            .sort(sortObj)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Registration.countDocuments(query);

        res.json({
            success: true,
            data: registrations,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registrations',
            error: error.message
        });
    }
});

// GET - Retrieve single registration by ID (protected, admin only)
router.get('/:id', auth, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        res.json({
            success: true,
            data: registration
        });
    } catch (error) {
        console.error('Error fetching registration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registration',
            error: error.message
        });
    }
});

// PATCH - Approve registration and create user account (protected, admin only)
router.patch('/:id/approve', auth, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        if (registration.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Registration is already ${registration.status}`
            });
        }

        // Import required modules
        const User = require('../models/User');
        const crypto = require('crypto');
        const { sendWelcomeEmail } = require('../utils/email');
        const notificationService = require('../services/notificationService');

        // Generate temporary password
        const temporaryPassword = crypto.randomBytes(4).toString('hex'); // 8-character password

        // Create user account
        const user = new User({
            username: registration.email.split('@')[0], // Use email prefix as username
            email: registration.email,
            password: temporaryPassword, // Will be hashed by pre-save hook
            fullName: registration.fullName,
            phone: registration.phoneNumber,
            registrationId: registration._id
        });

        await user.save();

        // Update registration
        registration.status = 'account_created';
        registration.userId = user._id;
        registration.approvedBy = req.admin.id;
        registration.approvedAt = new Date();
        await registration.save();

        // Send welcome email with credentials
        sendWelcomeEmail(user, temporaryPassword).catch(err => {
            console.error('Failed to send welcome email:', err);
        });

        // Create notification
        notificationService.notifyApplicationApproved(user, temporaryPassword).catch(err => {
            console.error('Failed to create notification:', err);
        });

        // Log activity
        activityService.logActivity(
            req.admin.id,
            'application_approved',
            'registration',
            registration._id,
            `Approved application for ${registration.fullName}`,
            { email: registration.email, userId: user._id },
            req.ip
        ).catch(err => {
            console.error('Failed to log activity:', err);
        });

        res.json({
            success: true,
            message: 'Application approved successfully. User account created and welcome email sent.',
            data: {
                registration,
                user: user.toJSON()
            }
        });
    } catch (error) {
        console.error('Error approving registration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve registration',
            error: error.message
        });
    }
});

// PATCH - Reject registration (protected, admin only)
router.patch('/:id/reject', auth, async (req, res) => {
    try {
        const { reason } = req.body;

        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        if (registration.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Registration is already ${registration.status}`
            });
        }

        // Update registration
        registration.status = 'rejected';
        registration.rejectionReason = reason || '';
        registration.approvedBy = req.admin.id;
        registration.approvedAt = new Date();
        await registration.save();

        // Send rejection email
        const { sendStatusUpdateEmail } = require('../utils/email');
        sendStatusUpdateEmail(registration).catch(err => {
            console.error('Failed to send rejection email:', err);
        });

        // Log activity
        activityService.logActivity(
            req.admin.id,
            'application_rejected',
            'registration',
            registration._id,
            `Rejected application for ${registration.fullName}`,
            { email: registration.email, reason: reason || 'No reason provided' },
            req.ip
        ).catch(err => {
            console.error('Failed to log activity:', err);
        });

        res.json({
            success: true,
            message: 'Application rejected. Notification email sent to applicant.',
            data: registration
        });
    } catch (error) {
        console.error('Error rejecting registration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject registration',
            error: error.message
        });
    }
});

// PATCH - Update registration status (legacy endpoint for backward compatibility)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected', 'account_created'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Use /approve or /reject endpoints instead.'
            });
        }

        const registration = await Registration.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        res.json({
            success: true,
            message: 'Status updated successfully.',
            data: registration
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        });
    }
});


// DELETE - Delete registration (protected, admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const registration = await Registration.findByIdAndDelete(req.params.id);

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        // Log activity
        activityService.logActivity(
            req.admin.id,
            'application_deleted',
            'registration',
            registration._id,
            `Deleted application for ${registration.fullName}`,
            { email: registration.email, status: registration.status },
            req.ip
        ).catch(err => {
            console.error('Failed to log activity:', err);
        });

        res.json({
            success: true,
            message: 'Registration deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete registration',
            error: error.message
        });
    }
});

// GET - Statistics (protected, admin only)
router.get('/stats/overview', auth, async (req, res) => {
    try {
        const total = await Registration.countDocuments();
        const pending = await Registration.countDocuments({ status: 'pending' });
        const approved = await Registration.countDocuments({ status: 'approved' });
        const rejected = await Registration.countDocuments({ status: 'rejected' });
        const accountCreated = await Registration.countDocuments({ status: 'account_created' });

        // Get recent submissions (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCount = await Registration.countDocuments({
            submittedAt: { $gte: sevenDaysAgo }
        });

        res.json({
            success: true,
            data: {
                total,
                pending,
                approved,
                rejected,
                accountCreated,
                recentSubmissions: recentCount
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
});

module.exports = router;
