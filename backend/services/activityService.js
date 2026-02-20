const AdminActivity = require('../models/AdminActivity');

class ActivityService {
    /**
     * Log an admin activity
     * @param {String} adminId - The ID of the admin performing the action
     * @param {String} action - The action being performed
     * @param {String} targetType - The type of target (registration, event, user, role, system)
     * @param {String} targetId - The ID of the target resource
     * @param {String} description - Human-readable description of the action
     * @param {Object} metadata - Additional metadata about the action
     * @param {String} ipAddress - IP address of the admin
     * @returns {Promise<AdminActivity>}
     */
    async logActivity(adminId, action, targetType, targetId, description, metadata = {}, ipAddress = null) {
        try {
            const activity = new AdminActivity({
                adminId,
                action,
                targetType,
                targetId,
                description,
                metadata,
                ipAddress
            });

            await activity.save();
            return activity;
        } catch (error) {
            console.error('Error logging activity:', error);
            // Don't throw - we don't want activity logging failures to break the main operation
            return null;
        }
    }

    /**
     * Get recent activities with pagination
     * @param {Number} limit - Number of activities to return
     * @param {Number} page - Page number
     * @param {String} action - Filter by action type
     * @param {String} adminId - Filter by admin ID
     * @returns {Promise<Object>}
     */
    async getRecentActivity(limit = 20, page = 1, action = null, adminId = null) {
        try {
            const query = {};
            if (action) query.action = action;
            if (adminId) query.adminId = adminId;

            const skip = (page - 1) * limit;
            const total = await AdminActivity.countDocuments(query);

            const activities = await AdminActivity.find(query)
                .populate('adminId', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            return {
                success: true,
                data: activities,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit
                }
            };
        } catch (error) {
            console.error('Error fetching activities:', error);
            throw error;
        }
    }

    /**
     * Get activities by admin
     * @param {String} adminId - The admin ID
     * @param {Number} limit - Number of activities to return
     * @returns {Promise<Array>}
     */
    async getActivityByAdmin(adminId, limit = 20) {
        try {
            const activities = await AdminActivity.find({ adminId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();

            return activities;
        } catch (error) {
            console.error('Error fetching admin activities:', error);
            throw error;
        }
    }

    /**
     * Get activity statistics
     * @returns {Promise<Object>}
     */
    async getActivityStats() {
        try {
            // Total activities
            const total = await AdminActivity.countDocuments();

            // Activities by action type
            const byAction = await AdminActivity.aggregate([
                {
                    $group: {
                        _id: '$action',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]);

            // Activities by admin
            const byAdmin = await AdminActivity.aggregate([
                {
                    $group: {
                        _id: '$adminId',
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'admins',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'admin'
                    }
                },
                {
                    $unwind: '$admin'
                },
                {
                    $project: {
                        _id: 0,
                        adminId: '$_id',
                        adminName: '$admin.username',
                        count: 1
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]);

            // Recent activity count (last 24 hours)
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            const recentCount = await AdminActivity.countDocuments({
                createdAt: { $gte: oneDayAgo }
            });

            return {
                success: true,
                data: {
                    total,
                    recentCount,
                    byAction,
                    byAdmin
                }
            };
        } catch (error) {
            console.error('Error fetching activity stats:', error);
            throw error;
        }
    }
}

module.exports = new ActivityService();
