const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Resend } = require('resend');
const GetInvolvedSubmission = require('../models/GetInvolvedSubmission');
const { requireCMSUser, requireSection } = require('../middleware/cmsAuth');

// These submissions come from the church website and are read in /cms, so they
// belong to the CMS identity realm. They previously used middleware/auth, which
// verifies the media-team Admin JWT — meaning /cms/get-involved could never
// read them however valid the CMS session was.
const auth = [requireCMSUser, requireSection('get-involved')];

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM  = process.env.EMAIL_FROM || `ACK Mombasa Memorial Cathedral <${process.env.EMAIL_USER}>`;
const ADMIN = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

// This endpoint is public and previously had neither a honeypot nor a
// per-route limiter — only the global 1000/15min. /api/inbox has both, and an
// unprotected public write fills the inbox with spam until staff stop reading
// it, which quietly undoes the point of having the form.
const submitLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many submissions. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const validation = [
    body('website').isEmpty().withMessage('Rejected'), // honeypot: bots fill it, humans never see it
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('type').isIn(['membership', 'volunteer', 'application']).withMessage('Invalid submission type'),
];

// POST /api/get-involved — public form submission
router.post('/', submitLimiter, validation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { firstName, lastName, email, phone, address, baptized, confirmed, previousChurch, ministries, message, type } = req.body;
    const fullName = `${firstName} ${lastName}`;
    const typeName = type === 'membership'
        ? 'Membership Application'
        : type === 'application'
            ? `Application — ${req.body.opportunityRole || 'Open Role'}`
            : 'Volunteer Sign-Up';
    const ministriesList = Array.isArray(ministries) && ministries.length ? ministries.join(', ') : '—';

    try {
        // Save first. The two emails below are deliberately NOT awaited: they
        // used to be, which meant a Resend outage returned 500 for a submission
        // that had already been stored — so the visitor submitted again and the
        // office got duplicates.
        await GetInvolvedSubmission.create({
            firstName, lastName, email, phone, address, type,
            baptized, confirmed, previousChurch,
            ministries: Array.isArray(ministries) ? ministries : [],
            message,
            opportunityId: req.body.opportunityId,
            opportunityRole: req.body.opportunityRole,
            coverLetter: req.body.coverLetter,
        });

        // Confirmation to applicant
        resend.emails.send({
            from: FROM,
            to: [email],
            subject: `Thank you for your ${typeName} — ACK Mombasa Memorial Cathedral`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
                    <div style="background:#1e3a8a;padding:32px;text-align:center;border-radius:12px 12px 0 0">
                        <h1 style="color:white;margin:0;font-size:22px">ACK Mombasa Memorial Cathedral</h1>
                        <p style="color:#bfdbfe;margin:8px 0 0">${typeName} Received</p>
                    </div>
                    <div style="background:#f8fafc;padding:32px;border-radius:0 0 12px 12px">
                        <p>Dear <strong>${fullName}</strong>,</p>
                        <p>Thank you for submitting your <strong>${typeName.toLowerCase()}</strong>. We have received your details and our team will be in touch within <strong>3–5 business days</strong>.</p>
                        ${ministries?.length ? `<p><strong>Ministries of interest:</strong> ${ministriesList}</p>` : ''}
                        ${message ? `<p><strong>Your message:</strong> ${message}</p>` : ''}
                        <p style="margin-top:32px">God bless you,<br/><strong>ACK Mombasa Memorial Cathedral</strong></p>
                    </div>
                </div>
            `,
        }).catch((e) => console.error('Applicant confirmation email failed:', e.message));

        // Notification to admin
        resend.emails.send({
            from: FROM,
            to: [ADMIN],
            subject: `New ${typeName}: ${fullName}`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
                    <div style="background:#1e3a8a;padding:24px;border-radius:12px 12px 0 0">
                        <h2 style="color:white;margin:0;font-size:18px">New ${typeName}</h2>
                    </div>
                    <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px">
                        <table style="width:100%;border-collapse:collapse">
                            <tr><td style="padding:8px 0;color:#64748b;width:40%">Name</td><td style="padding:8px 0;font-weight:600">${fullName}</td></tr>
                            <tr><td style="padding:8px 0;color:#64748b">Email</td><td style="padding:8px 0">${email}</td></tr>
                            <tr><td style="padding:8px 0;color:#64748b">Phone</td><td style="padding:8px 0">${phone}</td></tr>
                            ${address ? `<tr><td style="padding:8px 0;color:#64748b">Address</td><td style="padding:8px 0">${address}</td></tr>` : ''}
                            ${type === 'membership' ? `
                            <tr><td style="padding:8px 0;color:#64748b">Baptized</td><td style="padding:8px 0">${baptized || '—'}</td></tr>
                            <tr><td style="padding:8px 0;color:#64748b">Confirmed</td><td style="padding:8px 0">${confirmed || '—'}</td></tr>
                            <tr><td style="padding:8px 0;color:#64748b">Previous Church</td><td style="padding:8px 0">${previousChurch || '—'}</td></tr>
                            ` : ''}
                            <tr><td style="padding:8px 0;color:#64748b">Ministries</td><td style="padding:8px 0">${ministriesList}</td></tr>
                            ${message ? `<tr><td style="padding:8px 0;color:#64748b">Message</td><td style="padding:8px 0">${message}</td></tr>` : ''}
                        </table>
                    </div>
                </div>
            `,
        }).catch((e) => console.error('Admin notification email failed:', e.message));

        res.json({ success: true, message: 'Submission received.' });
    } catch (err) {
        console.error('Get-involved error:', err);
        res.status(500).json({ success: false, message: 'Failed to process submission.' });
    }
});

// GET /api/get-involved — list all submissions (admin only)
router.get('/', auth, async (req, res) => {
    try {
        const { type, status, limit = 100, skip = 0 } = req.query;
        const filter = {};
        if (type && ['membership', 'volunteer', 'application'].includes(type)) filter.type = type;
        if (status && ['pending', 'reviewed', 'accepted', 'declined'].includes(status)) filter.status = status;

        const [submissions, total] = await Promise.all([
            GetInvolvedSubmission.find(filter).sort({ createdAt: -1 }).limit(Number(limit)).skip(Number(skip)).lean(),
            GetInvolvedSubmission.countDocuments(filter),
        ]);
        res.json({ success: true, submissions, total });
    } catch (err) {
        console.error('Get-involved list error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch submissions.' });
    }
});

// PATCH /api/get-involved/:id/status — update status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'accepted', 'declined'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }
    try {
        const submission = await GetInvolvedSubmission.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });
        res.json({ success: true, submission });
    } catch (err) {
        console.error('Status update error:', err);
        res.status(500).json({ success: false, message: 'Failed to update status.' });
    }
});

// DELETE /api/get-involved/:id — delete a submission (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        await GetInvolvedSubmission.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete submission.' });
    }
});

module.exports = router;
