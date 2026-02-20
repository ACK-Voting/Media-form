const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/analytics/overview - Get comprehensive analytics overview
router.get('/overview', auth, async (req, res) => {
    try {
        // Get date 30 days ago for trends
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Application trends (last 30 days, grouped by date)
        const applicationTrends = await Registration.aggregate([
            {
                $match: {
                    submittedAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$submittedAt'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Skills distribution (approved/account_created only)
        const skillsDistribution = await Registration.aggregate([
            {
                $match: {
                    status: { $in: ['approved', 'account_created'] }
                }
            },
            {
                $unwind: '$mediaSkills'
            },
            {
                $group: {
                    _id: '$mediaSkills',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Approval rate by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const approvalRateByMonth = await Registration.aggregate([
            {
                $match: {
                    submittedAt: { $gte: sixMonthsAgo },
                    status: { $in: ['approved', 'rejected', 'account_created'] }
                }
            },
            {
                $group: {
                    _id: {
                        month: {
                            $dateToString: {
                                format: '%Y-%m',
                                date: '$submittedAt'
                            }
                        },
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.month',
                    approved: {
                        $sum: {
                            $cond: [
                                { $in: ['$_id.status', ['approved', 'account_created']] },
                                '$count',
                                0
                            ]
                        }
                    },
                    rejected: {
                        $sum: {
                            $cond: [
                                { $eq: ['$_id.status', 'rejected'] },
                                '$count',
                                0
                            ]
                        }
                    },
                    total: { $sum: '$count' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Geographic distribution (top 10 parishes)
        const geographicDistribution = await Registration.aggregate([
            {
                $match: {
                    status: { $in: ['approved', 'account_created'] }
                }
            },
            {
                $group: {
                    _id: '$parishLocation',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);

        // Gender distribution
        const genderDistribution = await Registration.aggregate([
            {
                $match: {
                    status: { $in: ['approved', 'account_created'] }
                }
            },
            {
                $group: {
                    _id: '$gender',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Age range distribution
        const ageRangeDistribution = await Registration.aggregate([
            {
                $match: {
                    status: { $in: ['approved', 'account_created'] }
                }
            },
            {
                $group: {
                    _id: '$ageRange',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                applicationTrends,
                skillsDistribution,
                approvalRateByMonth,
                geographicDistribution,
                genderDistribution,
                ageRangeDistribution
            }
        });
    } catch (error) {
        console.error('Error fetching analytics overview:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics overview',
            error: error.message
        });
    }
});

// GET /api/analytics/events - Get event analytics
router.get('/events', auth, async (req, res) => {
    try {
        // Event count by type
        const eventCountByType = await Event.aggregate([
            {
                $group: {
                    _id: '$eventType',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Average attendance per event type
        const avgAttendanceByType = await Event.aggregate([
            {
                $group: {
                    _id: '$eventType',
                    avgAttendees: {
                        $avg: { $size: { $ifNull: ['$attendees', []] } }
                    },
                    totalEvents: { $sum: 1 }
                }
            },
            {
                $sort: { avgAttendees: -1 }
            }
        ]);

        // Upcoming vs past events
        const now = new Date();
        const upcomingCount = await Event.countDocuments({
            eventDate: { $gte: now }
        });
        const pastCount = await Event.countDocuments({
            eventDate: { $lt: now }
        });

        // Events timeline (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const eventsTimeline = await Event.aggregate([
            {
                $match: {
                    eventDate: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m',
                            date: '$eventDate'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                eventCountByType,
                avgAttendanceByType,
                upcomingCount,
                pastCount,
                eventsTimeline
            }
        });
    } catch (error) {
        console.error('Error fetching event analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event analytics',
            error: error.message
        });
    }
});

// GET /api/analytics/members - Get member analytics
router.get('/members', auth, async (req, res) => {
    try {
        // Total active members
        const totalActive = await User.countDocuments({ isActive: true });
        const totalInactive = await User.countDocuments({ isActive: false });

        // Member growth over time (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const memberGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m',
                            date: '$createdAt'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                totalActive,
                totalInactive,
                memberGrowth
            }
        });
    } catch (error) {
        console.error('Error fetching member analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch member analytics',
            error: error.message
        });
    }
});

module.exports = router;
