const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    responsibilities: [{
        type: String,
        trim: true
    }],
    permissions: [{
        type: String,
        enum: [
            'view_calendar',
            'view_minutes',
            'upload_minutes',
            'edit_minutes',
            'delete_minutes',
            'create_events',
            'edit_events',
            'delete_events',
            'manage_users',
            'assign_roles',
            'create_content',
            'approve_registrations'
        ]
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create slug from name before saving
roleSchema.pre('save', function (next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
    }
    next();
});

module.exports = mongoose.model('Role', roleSchema);
