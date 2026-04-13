const mongoose = require('mongoose');

const SERVICES = ['0700', '0900', '1100', '1800'];

// Availability for a specific calendar date
const dateAvailabilitySchema = new mongoose.Schema({
    date: { type: Date, required: true },      // the specific Sunday
    services: { type: [String], enum: SERVICES, default: [] },
}, { _id: false });

const blockedDateSchema = new mongoose.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, trim: true, default: '' },
}, { _id: true });

const availabilitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    // Per specific Sunday date: which services the member is available for
    dateAvailability: {
        type: [dateAvailabilitySchema],
        default: [],
    },
    // Specific date ranges the member is NOT available
    blockedDates: {
        type: [blockedDateSchema],
        default: [],
    },
    googleCalendarConnected: {
        type: Boolean,
        default: false,
    },
    notes: {
        type: String,
        trim: true,
        default: '',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Availability', availabilitySchema);
