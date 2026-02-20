const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { verifyUserToken, checkPermissions } = require('../middleware/roleAuth');
const notificationService = require('../services/notificationService');
const { sendRoleAssignmentEmail } = require('../utils/email');
const activityService = require('../services/activityService');

// GET /api/roles - Get all active roles (public/protected)
router.get('/', async (req, res) => {
    try {
        const roles = await Role.find({ isActive: true }).sort({ name: 1 });

        res.json({
            success: true,
            roles
        });
    } catch (error) {
        console.error('Get roles error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// GET /api/roles/:id - Get role details
router.get('/:id', async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        res.json({
            success: true,
            role
        });
    } catch (error) {
        console.error('Get role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// POST /api/roles - Create new role (admin only)
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, responsibilities, permissions } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Name and description are required'
            });
        }

        const role = new Role({
            name,
            description,
            responsibilities: responsibilities || [],
            permissions: permissions || []
        });

        await role.save();

        res.status(201).json({
            success: true,
            message: 'Role created successfully',
            role
        });
    } catch (error) {
        console.error('Create role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// PUT /api/roles/:id - Update role (admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, description, responsibilities, permissions, isActive } = req.body;

        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        if (name) role.name = name;
        if (description) role.description = description;
        if (responsibilities) role.responsibilities = responsibilities;
        if (permissions) role.permissions = permissions;
        if (isActive !== undefined) role.isActive = isActive;

        await role.save();

        res.json({
            success: true,
            message: 'Role updated successfully',
            role
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// DELETE /api/roles/:id - Deactivate role (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        role.isActive = false;
        await role.save();

        res.json({
            success: true,
            message: 'Role deactivated successfully'
        });
    } catch (error) {
        console.error('Delete role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// GET /api/roles/users/:userId/roles - Get user's roles
router.get('/users/:userId/roles', verifyUserToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const requestingUserId = String(req.user._id);

        // Users can only view their own roles unless they're admin
        if (userId !== requestingUserId && !req.admin) {
            console.log('Authorization failed:', { userId, requestingUserId, admin: req.admin });
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const userRoles = await UserRole.find({ userId })
            .populate('roleId')
            .populate('assignedBy', 'username email');

        console.log('User roles query:', {
            userId,
            rolesFound: userRoles.length,
            roles: userRoles.map(ur => ({
                id: ur._id,
                roleName: ur.roleId?.name,
                hasRoleId: !!ur.roleId
            }))
        });

        // Return the userRoles with populated roleId
        res.json({
            success: true,
            roles: userRoles
        });
    } catch (error) {
        console.error('Get user roles error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// POST /api/users/:userId/roles - Assign role to user (admin only)
router.post('/users/:userId/roles', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { roleId, notes } = req.body;

        if (!roleId) {
            return res.status(400).json({
                success: false,
                message: 'Role ID is required'
            });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if role exists
        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        // Check if already assigned
        const existing = await UserRole.findOne({ userId, roleId });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Role already assigned to this user'
            });
        }

        // Create assignment
        const userRole = new UserRole({
            userId,
            roleId,
            assignedBy: req.admin.id,
            notes
        });

        await userRole.save();

        // Send notification
        await notificationService.notifyRoleAssigned(user, role);

        // Send email
        await sendRoleAssignmentEmail(user, role);

        // Log activity
        activityService.logActivity(
            req.admin.id,
            'role_assigned',
            'role',
            roleId,
            `Assigned role "${role.name}" to ${user.fullName}`,
            { userId: user._id, roleName: role.name, userName: user.fullName },
            req.ip
        ).catch(err => {
            console.error('Failed to log activity:', err);
        });

        res.status(201).json({
            success: true,
            message: 'Role assigned successfully',
            userRole
        });
    } catch (error) {
        console.error('Assign role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// DELETE /api/users/:userId/roles/:roleId - Remove role from user (admin only)
router.delete('/users/:userId/roles/:roleId', auth, async (req, res) => {
    try {
        const { userId, roleId } = req.params;

        const userRole = await UserRole.findOneAndDelete({ userId, roleId });

        if (!userRole) {
            return res.status(404).json({
                success: false,
                message: 'Role assignment not found'
            });
        }

        // Get user and role for notification
        const user = await User.findById(userId);
        const role = await Role.findById(roleId);

        if (user && role) {
            await notificationService.notifyRoleRemoved(user, role);

            // Log activity
            activityService.logActivity(
                req.admin.id,
                'role_removed',
                'role',
                roleId,
                `Removed role "${role.name}" from ${user.fullName}`,
                { userId: user._id, roleName: role.name, userName: user.fullName },
                req.ip
            ).catch(err => {
                console.error('Failed to log activity:', err);
            });
        }

        res.json({
            success: true,
            message: 'Role removed successfully'
        });
    } catch (error) {
        console.error('Remove role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
