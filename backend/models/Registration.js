const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    // Personal Information
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female']
    },
    ageRange: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    parishLocation: {
        type: String,
        trim: true
    },
    parishName: {
        type: String,
        trim: true
    },
    isMember: {
        type: Boolean,
        required: true
    },
    membershipNumber: {
        type: String,
        trim: true
    },

    // Media Team Skills & Interests
    mediaSkills: [{
        type: String,
        enum: [
            'photography',
            'videography',
            'video-editing',
            'graphic-design',
            'social-media',
            'content-writing',
            'live-streaming',
            'public-relations'
        ]
    }],
    otherSkills: {
        type: String,
        trim: true
    },
    areaOfInterest: [{
        type: String
    }],
    hasExperience: {
        type: Boolean,
        required: true
    },
    experienceDetails: {
        type: String,
        trim: true
    },
    hasEquipment: {
        type: Boolean
    },
    equipmentDescription: {
        type: String,
        trim: true
    },

    // Availability & Commitment
    availability: {
        type: String,
        required: true,
        trim: true
    },
    commitment: {
        type: String,
        required: true,
        trim: true
    },

    // Emergency Contact
    emergencyContactName: {
        type: String,
        required: true,
        trim: true
    },
    emergencyContactRelationship: {
        type: String,
        required: true,
        trim: true
    },
    emergencyContactPhone: {
        type: String,
        required: true,
        trim: true
    },

    // Additional Information
    additionalInfo: {
        type: String,
        trim: true
    },

    // Metadata
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'account_created'],
        default: 'pending'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    approvedAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        trim: true
    }

}, {
    timestamps: true
});

// Index for searching
registrationSchema.index({ fullName: 'text', email: 'text' });

module.exports = mongoose.model('Registration', registrationSchema);
