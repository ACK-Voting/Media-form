const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    eventTime: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    eventType: {
        type: String,
        required: true,
        enum: ['meeting', 'service', 'training', 'event', 'other'],
        default: 'meeting'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isPublic: {
        type: Boolean,
        default: true
    },
    reminderSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for date-based queries
eventSchema.index({ eventDate: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ isPublic: 1, eventDate: 1 });

module.exports = mongoose.model('Event', eventSchema);
