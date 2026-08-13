const express = require('express');
const router = express.Router();

const LedgerEntry = require('../models/LedgerEntry');
const { requireCMSUser, requireSuperAdmin } = require('../middleware/cmsAuth');
const { logActivity } = require('../utils/activityLog');

/**
 * The manual financial ledger.
 *
 * Super admin only, on every route — not a `contentSections` entry. Editing the
 * *giving information* page is church-admin work; the record of what the church
 * actually received and spent is narrower than that, and 'ledger' in
 * CHURCH_ADMIN_SECTIONS would have quietly widened it.
 *
 * Every mutation is written to the audit log. That matters more here than
 * anywhere else in the CMS: "who changed this figure, and when" is the first
 * question anyone will ask of a church's books.
 */
const auth = [requireCMSUser, requireSuperAdmin];

const TYPES = ['income', 'expense'];
const METHODS = ['mpesa', 'bank', 'cash', 'cheque', 'other'];

/** Turns ?from=&to=&type=&category= into a Mongo filter. */
function buildFilter(query) {
    const filter = {};

    if (query.from || query.to) {
        filter.date = {};
        if (query.from) filter.date.$gte = new Date(query.from);
        // Inclusive of the closing day: a treasurer asking for 1–31 January
        // means the whole of the 31st, not up to midnight at its start.
        if (query.to) {
            const to = new Date(query.to);
            to.setHours(23, 59, 59, 999);
            filter.date.$lte = to;
        }
    }
    if (TYPES.includes(query.type)) filter.type = query.type;
    if (query.category) filter.category = query.category;

    return filter;
}

/**
 * Validates and normalises a submitted entry.
 *
 * Returns { error } or { value }. Amount is parsed rather than trusted: a
 * string like "12,000" from a paste would otherwise become NaN and save as
 * null.
 */
function parseEntry(body) {
    const { date, type, category, description, reference, method } = body;

    if (!date || Number.isNaN(new Date(date).getTime())) {
        return { error: 'A valid date is required.' };
    }
    if (!TYPES.includes(type)) {
        return { error: 'Type must be income or expense.' };
    }
    if (!category || !String(category).trim()) {
        return { error: 'A category is required.' };
    }

    const amount = Number(String(body.amount).replace(/,/g, ''));
    if (!Number.isFinite(amount) || amount < 0) {
        return { error: 'Amount must be a number of KES, zero or more.' };
    }

    return {
        value: {
            date: new Date(date),
            type,
            category: String(category).trim(),
            amount,
            description: description ? String(description).trim() : '',
            reference: reference ? String(reference).trim() : '',
            method: METHODS.includes(method) ? method : 'other',
        },
    };
}

// GET /api/ledger — entries plus the totals for the same filter
router.get('/', auth, async (req, res) => {
    try {
        const filter = buildFilter(req.query);
        const limit = Math.min(Number(req.query.limit) || 50, 200);
        const skip = Math.max(Number(req.query.skip) || 0, 0);

        const [items, total, summary] = await Promise.all([
            LedgerEntry.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
            LedgerEntry.countDocuments(filter),
            // Totals are aggregated over the whole filter, not the current
            // page — a "net" that only counted the first fifty rows would be
            // worse than showing nothing.
            LedgerEntry.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: { type: '$type', category: '$category' },
                        total: { $sum: '$amount' },
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        let income = 0;
        let expense = 0;
        const byCategory = summary.map((row) => {
            if (row._id.type === 'income') income += row.total;
            else expense += row.total;
            return {
                type: row._id.type,
                category: row._id.category,
                total: row.total,
                count: row.count,
            };
        });
        byCategory.sort((a, b) => b.total - a.total);

        res.json({
            success: true,
            items: items.map((i) => i.toJSONSafe()),
            total,
            hasMore: skip + items.length < total,
            summary: { income, expense, net: income - expense, byCategory },
        });
    } catch (err) {
        console.error('Ledger fetch error:', err);
        res.status(500).json({ success: false, message: 'Failed to load the ledger.' });
    }
});

// POST /api/ledger — record an entry
router.post('/', auth, async (req, res) => {
    const { error, value } = parseEntry(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    try {
        const entry = await LedgerEntry.create({
            ...value,
            recordedBy: { id: req.cmsUser.id, name: req.cmsUser.name },
        });
        logActivity({
            actor: req.cmsUser,
            action: 'create',
            section: 'ledger',
            itemId: entry._id.toString(),
            label: `${value.type} — ${value.category}, KES ${value.amount.toLocaleString('en-KE')}`,
        });
        res.status(201).json({ success: true, entry: entry.toJSONSafe() });
    } catch (err) {
        console.error('Ledger create error:', err);
        res.status(500).json({ success: false, message: 'Failed to save the entry.' });
    }
});

// PATCH /api/ledger/:id — correct an entry
router.patch('/:id', auth, async (req, res) => {
    const { error, value } = parseEntry(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    try {
        const before = await LedgerEntry.findById(req.params.id);
        if (!before) return res.status(404).json({ success: false, message: 'Entry not found.' });

        // recordedBy is not reassigned on edit: it records who entered the line
        // originally, and the audit log carries who changed it since.
        Object.assign(before, value);
        await before.save();

        logActivity({
            actor: req.cmsUser,
            action: 'update',
            section: 'ledger',
            itemId: before._id.toString(),
            label: `${value.type} — ${value.category}, KES ${value.amount.toLocaleString('en-KE')}`,
        });
        res.json({ success: true, entry: before.toJSONSafe() });
    } catch (err) {
        console.error('Ledger update error:', err);
        res.status(500).json({ success: false, message: 'Failed to update the entry.' });
    }
});

// DELETE /api/ledger/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const removed = await LedgerEntry.findByIdAndDelete(req.params.id);
        if (!removed) return res.status(404).json({ success: false, message: 'Entry not found.' });

        // The label carries the figures, so the audit log still says what was
        // removed after the entry itself is gone.
        logActivity({
            actor: req.cmsUser,
            action: 'delete',
            section: 'ledger',
            itemId: removed._id.toString(),
            label: `${removed.type} — ${removed.category}, KES ${removed.amount.toLocaleString('en-KE')} (${removed.date.toISOString().split('T')[0]})`,
        });
        res.json({ success: true });
    } catch (err) {
        console.error('Ledger delete error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete the entry.' });
    }
});

module.exports = router;
