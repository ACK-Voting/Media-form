const express = require('express');
const router = express.Router();
const Availability = require('../models/Availability');
const { verifyUserToken } = require('../middleware/roleAuth');

// GET /api/availability/me — get current user's availability
router.get('/me', verifyUserToken, async (req, res) => {
    try {
        let availability = await Availability.findOne({ userId: req.user._id });
        if (!availability) {
            return res.json({
                success: true,
                availability: {
                    dateAvailability: [],
                    blockedDates: [],
                    googleCalendarConnected: false,
                    notes: '',
                },
            });
        }
        res.json({ success: true, availability });
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve availability' });
    }
});

// PUT /api/availability/me — save/update current user's availability
router.put('/me', verifyUserToken, async (req, res) => {
    try {
        const { dateAvailability, blockedDates, googleCalendarConnected, notes } = req.body;

        const update = {};
        if (Array.isArray(dateAvailability)) update.dateAvailability = dateAvailability;
        if (Array.isArray(blockedDates)) update.blockedDates = blockedDates;
        if (typeof googleCalendarConnected === 'boolean') update.googleCalendarConnected = googleCalendarConnected;
        if (typeof notes === 'string') update.notes = notes;

        const availability = await Availability.findOneAndUpdate(
            { userId: req.user._id },
            { $set: update },
            { new: true, upsert: true, runValidators: true }
        );

        res.json({ success: true, availability, message: 'Availability updated' });
    } catch (error) {
        console.error('Save availability error:', error);
        res.status(500).json({ success: false, message: 'Failed to save availability' });
    }
});

// POST /api/availability/me/blocked-date — add a blocked date range
router.post('/me/blocked-date', verifyUserToken, async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.body;
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
        }

        const availability = await Availability.findOneAndUpdate(
            { userId: req.user._id },
            { $push: { blockedDates: { startDate, endDate, reason: reason || '' } } },
            { new: true, upsert: true }
        );

        res.json({ success: true, availability, message: 'Blocked date added' });
    } catch (error) {
        console.error('Add blocked date error:', error);
        res.status(500).json({ success: false, message: 'Failed to add blocked date' });
    }
});

// DELETE /api/availability/me/blocked-date/:dateId — remove a blocked date
router.delete('/me/blocked-date/:dateId', verifyUserToken, async (req, res) => {
    try {
        const availability = await Availability.findOneAndUpdate(
            { userId: req.user._id },
            { $pull: { blockedDates: { _id: req.params.dateId } } },
            { new: true }
        );

        if (!availability) {
            return res.status(404).json({ success: false, message: 'Availability not found' });
        }

        res.json({ success: true, availability, message: 'Blocked date removed' });
    } catch (error) {
        console.error('Remove blocked date error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove blocked date' });
    }
});

// GET /api/availability/sunday/:date — who is available on a specific Sunday
router.get('/sunday/:date', verifyUserToken, async (req, res) => {
    try {
        const date = new Date(req.params.date);
        if (isNaN(date.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date format' });
        }
        date.setHours(0, 0, 0, 0);
        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);

        // Find users with availability set for that specific date
        const availabilities = await Availability.find({
            'dateAvailability.date': { $gte: date, $lte: dateEnd },
        }).populate('userId', 'fullName email phone');

        // Filter out users who have that date blocked
        const result = availabilities
            .filter(a => {
                const isBlocked = a.blockedDates.some(b => {
                    const start = new Date(b.startDate);
                    const end = new Date(b.endDate);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    return date >= start && date <= end;
                });
                return !isBlocked;
            })
            .map(a => {
                const entry = a.dateAvailability.find(d => {
                    const dDate = new Date(d.date);
                    return dDate >= date && dDate <= dateEnd;
                });
                return {
                    user: a.userId,
                    services: entry?.services || [],
                    googleCalendarConnected: a.googleCalendarConnected,
                    notes: a.notes,
                };
            });

        res.json({ success: true, date: date.toISOString(), availableCount: result.length, available: result });
    } catch (error) {
        console.error('Sunday availability error:', error);
        res.status(500).json({ success: false, message: 'Failed to check availability' });
    }
});

module.exports = router;
