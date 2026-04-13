const express = require('express');
const router = express.Router();
const Rota = require('../models/Rota');
const Availability = require('../models/Availability');
const User = require('../models/User');
const { verifyUserToken } = require('../middleware/roleAuth');

// Admin token middleware (reuse admin JWT check from auth route pattern)
const jwt = require('jsonwebtoken');
const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        req.admin = decoded;
        next();
    });
};

// ─── Default service role templates ─────────────────────────────────────────
const DEFAULT_SERVICE_ROLES = {
    '0700': ['Projections', 'Sound', 'Camera'],
    '0900': ['Projections', 'Sound', 'Cam1', 'Cam2'],
    '1100': ['Projections', 'Sound', 'Cam 1', 'Cam 2'],
    '1800': ['Projection', 'Camera'],
};

// ─── GET /api/rota  — list all rotas (admin) ─────────────────────────────────
router.get('/', verifyAdminToken, async (req, res) => {
    try {
        const rotas = await Rota.find()
            .sort({ sundayDate: -1 })
            .limit(20)
            .lean();
        res.json({ success: true, rotas });
    } catch (error) {
        console.error('List rotas error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch rotas' });
    }
});

// ─── GET /api/rota/available/:date — who is available on a given Sunday ──────
router.get('/available/:date', verifyAdminToken, async (req, res) => {
    try {
        const date = new Date(req.params.date);
        if (isNaN(date.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date' });
        }

        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);
        const availabilities = await Availability.find({
            'dateAvailability.date': { $gte: date, $lte: dateEnd },
        }).populate('userId', 'fullName email');

        // Filter out blocked dates
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
                const dateEntry = a.dateAvailability.find(d => {
                    const dDate = new Date(d.date);
                    return dDate >= date && dDate <= dateEnd;
                });
                return {
                    userId: a.userId?._id,
                    fullName: a.userId?.fullName || 'Unknown',
                    email: a.userId?.email,
                    services: dateEntry?.services || [],
                    notes: a.notes,
                    googleCalendarConnected: a.googleCalendarConnected,
                };
            });

        res.json({ success: true, date: date.toISOString(), available: result });
    } catch (error) {
        console.error('Available members error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch available members' });
    }
});

// ─── GET /api/rota/:date — get or scaffold rota for a Sunday ─────────────────
router.get('/:date', verifyAdminToken, async (req, res) => {
    try {
        const date = new Date(req.params.date);
        if (isNaN(date.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date' });
        }
        date.setHours(0, 0, 0, 0);
        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);

        let rota = await Rota.findOne({ sundayDate: { $gte: date, $lte: dateEnd } }).lean();

        if (!rota) {
            // Return a scaffold (not saved yet)
            rota = {
                sundayDate: date.toISOString(),
                published: false,
                services: Object.entries(DEFAULT_SERVICE_ROLES).map(([time, roles]) => ({
                    time,
                    assignments: roles.map(role => ({ role, userId: null, memberName: '' })),
                })),
                closingMessage: "Let's all Prepare well.\nThank you.",
                _scaffold: true,
            };
        }

        res.json({ success: true, rota });
    } catch (error) {
        console.error('Get rota error:', error);
        res.status(500).json({ success: false, message: 'Failed to get rota' });
    }
});

// ─── PUT /api/rota/:date — save/update rota for a Sunday ─────────────────────
router.put('/:date', verifyAdminToken, async (req, res) => {
    try {
        const date = new Date(req.params.date);
        if (isNaN(date.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date' });
        }
        date.setHours(0, 0, 0, 0);

        const { services, closingMessage, published } = req.body;

        const update = {
            sundayDate: date,
            createdBy: req.admin._id,
        };
        if (Array.isArray(services)) update.services = services;
        if (typeof closingMessage === 'string') update.closingMessage = closingMessage;
        if (typeof published === 'boolean') {
            update.published = published;
            if (published) update.publishedAt = new Date();
        }

        const rota = await Rota.findOneAndUpdate(
            { sundayDate: { $gte: date, $lte: new Date(date.getTime() + 86399999) } },
            { $set: update },
            { new: true, upsert: true, runValidators: true }
        ).lean();

        res.json({ success: true, rota, message: 'Rota saved' });
    } catch (error) {
        console.error('Save rota error:', error);
        res.status(500).json({ success: false, message: 'Failed to save rota' });
    }
});

// ─── GET /api/rota/:date/text — generate the WhatsApp-style text ─────────────
router.get('/:date/text', verifyAdminToken, async (req, res) => {
    try {
        const date = new Date(req.params.date);
        if (isNaN(date.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date' });
        }
        date.setHours(0, 0, 0, 0);
        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);

        const rota = await Rota.findOne({ sundayDate: { $gte: date, $lte: dateEnd } }).lean();
        if (!rota) return res.status(404).json({ success: false, message: 'Rota not found' });

        const SERVICE_LABELS = {
            '0700': '0700hrs Service',
            '0900': '0900hrs service',
            '1100': '1100hrs service',
            '1800': '1800hrs service',
        };

        let text = '';
        for (const svc of rota.services) {
            text += `${SERVICE_LABELS[svc.time] || svc.time} \n \n`;
            for (const a of svc.assignments) {
                const name = a.memberName || '—';
                text += `${a.role.padEnd(12)}: ${name}\n`;
            }
            text += '\n';
        }
        text += `${rota.closingMessage}`;

        res.json({ success: true, text });
    } catch (error) {
        console.error('Generate rota text error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate rota text' });
    }
});

// ─── DELETE /api/rota/:date — delete a rota ──────────────────────────────────
router.delete('/:date', verifyAdminToken, async (req, res) => {
    try {
        const date = new Date(req.params.date);
        date.setHours(0, 0, 0, 0);
        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);
        await Rota.deleteOne({ sundayDate: { $gte: date, $lte: dateEnd } });
        res.json({ success: true, message: 'Rota deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete rota' });
    }
});

// ─── GET /api/rota/member/published — member view: latest published rotas ────
router.get('/member/published', verifyUserToken, async (req, res) => {
    try {
        const rotas = await Rota.find({ published: true })
            .sort({ sundayDate: -1 })
            .limit(4)
            .lean();
        res.json({ success: true, rotas });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch rotas' });
    }
});

module.exports = router;
