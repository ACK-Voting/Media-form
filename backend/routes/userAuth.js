const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const UserRole = require('../models/UserRole');
const { verifyUserToken } = require('../middleware/roleAuth');
const { sendPasswordResetEmail } = require('../utils/email');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            email: user.email,
            username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// POST /api/user/login - User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact the admin.'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Get user roles
        const userRoles = await UserRole.find({ userId: user._id })
            .populate('roleId');

        // Generate token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                profileImage: user.profileImage,
                roles: userRoles.map(ur => ur.roleId)
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// GET /api/user/profile - Get user profile
router.get('/profile', verifyUserToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user roles
        const userRoles = await UserRole.find({ userId: user._id })
            .populate('roleId');

        res.json({
            success: true,
            user: {
                ...user.toJSON(),
                roles: userRoles.map(ur => ({
                    ...ur.roleId.toJSON(),
                    assignedAt: ur.assignedAt,
                    notes: ur.notes
                }))
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// PUT /api/user/profile - Update user profile
router.put('/profile', verifyUserToken, async (req, res) => {
    try {
        const { fullName, phone, profileImage } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update allowed fields
        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;
        if (profileImage !== undefined) user.profileImage = profileImage;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// PUT /api/user/change-password - Change password
router.put('/change-password', verifyUserToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// POST /api/user/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists
            return res.json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.'
            });
        }

        // Generate reset token (valid for 1 hour)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send reset email
        await sendPasswordResetEmail(user, resetToken);

        res.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// POST /api/user/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Hash the token
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// POST /api/user/refresh-token - Refresh JWT token
router.post('/refresh-token', verifyUserToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid user'
            });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            token
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
