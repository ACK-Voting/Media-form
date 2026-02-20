const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserRole = require('../models/UserRole');
const Registration = require('../models/Registration');
const auth = require('../middleware/auth');

// GET /api/users - List all users with filters
router.get('/', auth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            search = '',
            isActive
        } = req.query;

        // Build query
        const query = {};

        // Filter by active status if provided
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        // Search across multiple fields
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await User.countDocuments(query);

        // Fetch users with populated registration data
        const users = await User.find(query)
            .populate('registrationId', 'mediaSkills parishLocation')
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Fetch roles for each user
        const usersWithRoles = await Promise.all(
            users.map(async (user) => {
                const userRoles = await UserRole.find({ userId: user._id })
                    .populate('roleId', 'name slug description')
                    .lean();

                return {
                    ...user,
                    roles: userRoles.map(ur => ur.roleId)
                };
            })
        );

        res.json({
            success: true,
            data: usersWithRoles,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});

// GET /api/users/stats - Get user statistics
router.get('/stats', auth, async (req, res) => {
    try {
        // Total users
        const total = await User.countDocuments();

        // Active users
        const active = await User.countDocuments({ isActive: true });

        // Inactive users
        const inactive = await User.countDocuments({ isActive: false });

        // Skills breakdown - aggregate from registrations
        const skillsBreakdown = await Registration.aggregate([
            {
                $match: {
                    status: { $in: ['approved', 'account_created'] },
                    userId: { $exists: true }
                }
            },
            {
                $unwind: '$mediaSkills'
            },
            {
                $group: {
                    _id: '$mediaSkills',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Parish distribution
        const parishDistribution = await Registration.aggregate([
            {
                $match: {
                    status: { $in: ['approved', 'account_created'] },
                    userId: { $exists: true }
                }
            },
            {
                $group: {
                    _id: '$parishLocation',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);

        // Role distribution
        const roleDistribution = await UserRole.aggregate([
            {
                $group: {
                    _id: '$roleId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'roles',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'role'
                }
            },
            {
                $unwind: '$role'
            },
            {
                $project: {
                    _id: 0,
                    roleName: '$role.name',
                    count: 1
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                total,
                active,
                inactive,
                skillsBreakdown,
                parishDistribution,
                roleDistribution
            }
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user statistics',
            error: error.message
        });
    }
});

// GET /api/users/:id - Get single user with full details
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('registrationId')
            .select('-password')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Fetch user roles
        const userRoles = await UserRole.find({ userId: user._id })
            .populate('roleId', 'name slug description responsibilities permissions')
            .populate('assignedBy', 'username email')
            .lean();

        res.json({
            success: true,
            data: {
                ...user,
                roles: userRoles
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
});

// PATCH /api/users/:id/status - Toggle user active status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Toggle the active status
        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                _id: user._id,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: error.message
        });
    }
});

module.exports = router;
