const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const User = require('../models/User');
const Event = require('../models/Event');
const UserRole = require('../models/UserRole');
const auth = require('../middleware/auth');

// GET /api/reports/applications - Generate applications report
router.get('/applications', auth, async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;

        // Build query
        let query = {};

        // Date range filter
        if (startDate || endDate) {
            query.submittedAt = {};
            if (startDate) query.submittedAt.$gte = new Date(startDate);
            if (endDate) query.submittedAt.$lte = new Date(endDate);
        }

        // Status filter
        if (status) {
            query.status = status;
        }

        // Get applications
        const applications = await Registration.find(query)
            .populate('approvedBy', 'username email')
            .sort({ submittedAt: -1 })
            .lean();

        // Generate summary
        const summary = {
            total: applications.length,
            byStatus: {},
            bySkill: {},
            byParish: {},
            byGender: {},
            byAgeRange: {}
        };

        // Calculate summary statistics
        applications.forEach(app => {
            // By status
            summary.byStatus[app.status] = (summary.byStatus[app.status] || 0) + 1;

            // By skills
            if (app.mediaSkills && app.mediaSkills.length > 0) {
                app.mediaSkills.forEach(skill => {
                    summary.bySkill[skill] = (summary.bySkill[skill] || 0) + 1;
                });
            }

            // By parish
            if (app.parishLocation) {
                summary.byParish[app.parishLocation] = (summary.byParish[app.parishLocation] || 0) + 1;
            }

            // By gender
            if (app.gender) {
                summary.byGender[app.gender] = (summary.byGender[app.gender] || 0) + 1;
            }

            // By age range
            if (app.ageRange) {
                summary.byAgeRange[app.ageRange] = (summary.byAgeRange[app.ageRange] || 0) + 1;
            }
        });

        res.json({
            success: true,
            data: {
                applications,
                summary
            }
        });
    } catch (error) {
        console.error('Error generating applications report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate applications report',
            error: error.message
        });
    }
});

// GET /api/reports/members - Generate members report
router.get('/members', auth, async (req, res) => {
    try {
        // Get all users
        const members = await User.find()
            .populate('registrationId', 'mediaSkills parishLocation')
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();

        // Get roles for each member
        const membersWithRoles = await Promise.all(
            members.map(async (member) => {
                const userRoles = await UserRole.find({ userId: member._id })
                    .populate('roleId', 'name slug')
                    .lean();

                return {
                    ...member,
                    roles: userRoles.map(ur => ur.roleId)
                };
            })
        );

        // Generate summary
        const summary = {
            total: membersWithRoles.length,
            active: membersWithRoles.filter(m => m.isActive).length,
            inactive: membersWithRoles.filter(m => !m.isActive).length,
            byRole: {},
            bySkill: {},
            byParish: {}
        };

        // Calculate summary statistics
        membersWithRoles.forEach(member => {
            // By role
            if (member.roles && member.roles.length > 0) {
                member.roles.forEach(role => {
                    if (role && role.name) {
                        summary.byRole[role.name] = (summary.byRole[role.name] || 0) + 1;
                    }
                });
            }

            // By skills
            if (member.registrationId && member.registrationId.mediaSkills) {
                member.registrationId.mediaSkills.forEach(skill => {
                    summary.bySkill[skill] = (summary.bySkill[skill] || 0) + 1;
                });
            }

            // By parish
            if (member.registrationId && member.registrationId.parishLocation) {
                const parish = member.registrationId.parishLocation;
                summary.byParish[parish] = (summary.byParish[parish] || 0) + 1;
            }
        });

        res.json({
            success: true,
            data: {
                members: membersWithRoles,
                summary
            }
        });
    } catch (error) {
        console.error('Error generating members report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate members report',
            error: error.message
        });
    }
});

// GET /api/reports/events - Generate events report
router.get('/events', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build query
        let query = {};

        // Date range filter
        if (startDate || endDate) {
            query.eventDate = {};
            if (startDate) query.eventDate.$gte = new Date(startDate);
            if (endDate) query.eventDate.$lte = new Date(endDate);
        }

        // Get events
        const events = await Event.find(query)
            .populate('createdBy', 'username email')
            .populate('attendees', 'fullName email')
            .sort({ eventDate: -1 })
            .lean();

        // Generate summary
        const summary = {
            total: events.length,
            byType: {},
            totalAttendees: 0,
            avgAttendees: 0,
            upcoming: 0,
            past: 0
        };

        const now = new Date();

        // Calculate summary statistics
        events.forEach(event => {
            // By type
            summary.byType[event.eventType] = (summary.byType[event.eventType] || 0) + 1;

            // Attendees
            const attendeeCount = event.attendees ? event.attendees.length : 0;
            summary.totalAttendees += attendeeCount;

            // Upcoming vs past
            if (new Date(event.eventDate) >= now) {
                summary.upcoming++;
            } else {
                summary.past++;
            }
        });

        summary.avgAttendees = events.length > 0
            ? Math.round(summary.totalAttendees / events.length)
            : 0;

        res.json({
            success: true,
            data: {
                events,
                summary
            }
        });
    } catch (error) {
        console.error('Error generating events report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate events report',
            error: error.message
        });
    }
});

module.exports = router;
