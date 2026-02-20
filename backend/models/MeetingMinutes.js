const mongoose = require('mongoose');

const meetingMinutesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    meetingDate: {
        type: Date,
        required: true
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    summary: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    attachments: [{
        filename: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
            required: true
        },
        path: {
            type: String,
            required: true
        },
        size: {
            type: Number
        },
        mimetype: {
            type: String
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for searching and date-based queries
meetingMinutesSchema.index({ title: 'text', content: 'text' });
meetingMinutesSchema.index({ meetingDate: -1 });
meetingMinutesSchema.index({ isPublished: 1, meetingDate: -1 });

module.exports = mongoose.model('MeetingMinutes', meetingMinutesSchema);
