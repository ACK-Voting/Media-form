const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    assignedAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Compound unique index to prevent duplicate role assignments
userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

// Index for efficient queries
userRoleSchema.index({ userId: 1 });
userRoleSchema.index({ roleId: 1 });

module.exports = mongoose.model('UserRole', userRoleSchema);
