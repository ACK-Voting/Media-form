const express = require('express');
const router = express.Router();
const activityService = require('../services/activityService');
const auth = require('../middleware/auth');

// GET /api/activity - Get recent activities (paginated)
router.get('/', auth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            action,
            adminId
        } = req.query;

        const result = await activityService.getRecentActivity(
            parseInt(limit),
            parseInt(page),
            action,
            adminId
        );

        res.json(result);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activities',
            error: error.message
        });
    }
});

// GET /api/activity/stats - Get activity statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const result = await activityService.getActivityStats();
        res.json(result);
    } catch (error) {
        console.error('Error fetching activity stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity statistics',
            error: error.message
        });
    }
});

// GET /api/activity/admin/:adminId - Get activities by admin
router.get('/admin/:adminId', auth, async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const activities = await activityService.getActivityByAdmin(
            req.params.adminId,
            parseInt(limit)
        );

        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        console.error('Error fetching admin activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin activities',
            error: error.message
        });
    }
});

module.exports = router;
