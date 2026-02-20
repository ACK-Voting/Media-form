const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { verifyUserToken } = require('../middleware/roleAuth');
const notificationService = require('../services/notificationService');

// GET /api/notifications - Get user notifications (paginated)
router.get('/', verifyUserToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await notificationService.getUserNotifications(
            req.user._id,
            page,
            limit
        );

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', verifyUserToken, async (req, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.user._id);

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', verifyUserToken, async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(
            req.params.id,
            req.user._id
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification marked as read',
            notification
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', verifyUserToken, async (req, res) => {
    try {
        await notificationService.markAllAsRead(req.user._id);

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', verifyUserToken, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
