const mongoose = require('mongoose');

const adminActivitySchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'application_approved',
            'application_rejected',
            'application_deleted',
            'event_created',
            'event_updated',
            'event_deleted',
            'role_assigned',
            'role_removed',
            'user_status_changed',
            'admin_login',
            'user_created'
        ]
    },
    targetType: {
        type: String,
        required: true,
        enum: ['registration', 'event', 'user', 'role', 'system']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: function() {
            // Dynamically determine which model to reference based on targetType
            switch (this.targetType) {
                case 'registration':
                    return 'Registration';
                case 'event':
                    return 'Event';
                case 'user':
                    return 'User';
                case 'role':
                    return 'Role';
                default:
                    return null;
            }
        }
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
adminActivitySchema.index({ adminId: 1, createdAt: -1 });
adminActivitySchema.index({ action: 1, createdAt: -1 });
adminActivitySchema.index({ targetType: 1, targetId: 1 });
adminActivitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminActivity', adminActivitySchema);
