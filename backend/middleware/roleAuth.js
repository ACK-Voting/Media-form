const jwt = require('jsonwebtoken');
const UserRole = require('../models/UserRole');
const Role = require('../models/Role');

/**
 * Middleware to check if user has required permissions
 */
const checkPermissions = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const userId = req.user._id;

            // Get user's roles
            const userRoles = await UserRole.find({ userId }).populate('roleId');

            if (!userRoles || userRoles.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to perform this action'
                });
            }

            // Collect all permissions from user's roles
            const userPermissions = new Set();
            userRoles.forEach(ur => {
                if (ur.roleId && ur.roleId.permissions) {
                    ur.roleId.permissions.forEach(p => userPermissions.add(p));
                }
            });

            // Check if user has at least one of the required permissions
            const hasPermission = requiredPermissions.some(permission =>
                userPermissions.has(permission)
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to perform this action',
                    requiredPermissions,
                    userPermissions: Array.from(userPermissions)
                });
            }

            // Attach permissions to request for later use
            req.userPermissions = Array.from(userPermissions);
            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking permissions'
            });
        }
    };
};

/**
 * Middleware to verify user JWT token
 */
const verifyUserToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying token'
        });
    }
};

module.exports = {
    checkPermissions,
    verifyUserToken
};
