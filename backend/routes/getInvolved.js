const express = require('express');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const mongoose = require('mongoose');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Resend } = require('resend');
const GetInvolvedSubmission = require('../models/GetInvolvedSubmission');
const ApplicationFile = require('../models/ApplicationFile');
const { requireCMSUser, requireSection } = require('../middleware/cmsAuth');
const { sendEmail, churchLayout, escapeHtml, OFFICE } = require('../utils/mailer');
const { logActivity } = require('../utils/activityLog');

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

/**
 * CV upload.
 *
 * The browser posts the file here, straight to this API — not through a Next
 * route on Netlify, whose request bodies are capped at roughly 4.5 MB. The one
 * CV uploaded during testing was 4.28 MB, so that cap was not theoretical.
 */
const CV_MAX_BYTES = 5 * 1024 * 1024;

const cvLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many uploads. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Memory storage, not middleware/upload.js: that one writes to disk, which is
// ephemeral on Render, and accepts images.
const cvUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: CV_MAX_BYTES, files: 1 },
}).single('file');

/**
 * Identifies the file from its leading bytes rather than from the browser's
 * Content-Type, which is attacker-controlled and means nothing.
 *
 * Returns the canonical type, or null if it is not a document we accept. The
 * stored contentType comes from here, so a file can never later be served back
 * as something that executes in a staff member's browser.
 */
function sniffDocument(buf) {
    if (buf.length < 8) return null;

    // %PDF-
    if (buf.subarray(0, 5).toString('latin1') === '%PDF-') {
        return { contentType: 'application/pdf', label: 'PDF', ext: 'pdf' };
    }

    // DOCX is a zip. The magic bytes alone would also accept any other zip, so
    // require the part every Word document contains; zip stores its entry names
    // uncompressed, which is what makes this findable.
    if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) {
        if (buf.includes('word/document.xml')) {
            return {
                contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                label: 'DOCX',
                ext: 'docx',
            };
        }
        return null;
    }

    // Legacy .doc — the OLE2 compound file header.
    const OLE2 = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    if (buf.subarray(0, 8).equals(OLE2)) {
        return { contentType: 'application/msword', label: 'DOC', ext: 'doc' };
    }

    return null;
}

const TYPE_LABELS = {
    'application/pdf': 'PDF',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

/** Keeps a hostile filename from reaching a Content-Disposition header. */
function safeFileName(name, ext) {
    const base = String(name || 'cv')
        .replace(/[\r\n"\\]/g, '')
        .replace(/[^\w.\- ]/g, '')
        .trim()
        .slice(0, 120);
    const stem = base.replace(/\.[^.]*$/, '') || 'cv';
    return `${stem}.${ext}`;
}

// POST /api/get-involved/cv — public; attach a CV before submitting the form
router.post('/cv', cvLimiter, (req, res) => {
    cvUpload(req, res, async (uploadErr) => {
        if (uploadErr) {
            const tooBig = uploadErr.code === 'LIMIT_FILE_SIZE';
            return res.status(tooBig ? 413 : 400).json({
                success: false,
                message: tooBig
                    ? 'That file is larger than 5 MB. Please upload a smaller CV.'
                    : 'Could not read that file. Please try again.',
            });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file was received.' });
        }

        const kind = sniffDocument(req.file.buffer);
        if (!kind) {
            return res.status(400).json({
                success: false,
                message: 'Please upload your CV as a PDF or Word document.',
            });
        }

        try {
            const fileName = safeFileName(req.file.originalname, kind.ext);
            const saved = await ApplicationFile.create({
                data: req.file.buffer,
                contentType: kind.contentType,
                fileName,
                size: req.file.size,
                // Expires unless an application claims it. Someone who picks a
                // file and then closes the tab should not leave bytes behind.
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });
            res.json({
                success: true,
                fileId: saved._id.toString(),
                fileName,
                fileType: kind.label,
                fileSize: req.file.size,
            });
        } catch (err) {
            console.error('CV upload error:', err);
            res.status(500).json({ success: false, message: 'Could not save that file. Please try again.' });
        }
    });
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

    // A CV, if one was uploaded to /cv a moment ago. Confirm it exists rather
    // than trusting the id, so a made-up value cannot attach a phantom file.
    let cvFile = null;
    if (req.body.cvFileId && mongoose.isValidObjectId(req.body.cvFileId)) {
        cvFile = await ApplicationFile.findById(req.body.cvFileId).select('fileName contentType').lean();
    }

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
            cvFileId: cvFile ? cvFile._id : null,
            cvFileName: cvFile ? cvFile.fileName : '',
            // Derived from what the bytes actually are, not from what the
            // browser claimed they were.
            cvFileType: cvFile ? (TYPE_LABELS[cvFile.contentType] || 'Document') : '',
        });

        // The application now owns the file, so stop it expiring.
        if (cvFile) {
            await ApplicationFile.updateOne({ _id: cvFile._id }, { $unset: { expiresAt: 1 } });
        }

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
        if (status && ['pending', 'reviewed', 'shortlisted', 'declined'].includes(status)) filter.status = status;

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

/**
 * GET /api/get-involved/:id/cv — serve an applicant's CV to CMS staff.
 *
 * Reached through the submission rather than by file id, so a leaked id is not
 * a URL, and so the same permission that lets someone read the application lets
 * them read its attachment.
 */
router.get('/:id/cv', auth, async (req, res) => {
    try {
        const submission = await GetInvolvedSubmission.findById(req.params.id).select('cvFileId').lean();
        if (!submission || !submission.cvFileId) {
            return res.status(404).json({ success: false, message: 'No CV on this application.' });
        }
        // Deliberately not .lean(): the schema's Buffer cast is what guarantees
        // a real Node Buffer here rather than a raw BSON Binary.
        const file = await ApplicationFile.findById(submission.cvFileId);
        if (!file) {
            return res.status(404).json({ success: false, message: 'That CV is no longer stored.' });
        }

        // nosniff matters here: the browser must not be free to reinterpret a
        // stored document as HTML and run it on the CMS origin.
        res.setHeader('Content-Type', file.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'private, no-store');
        res.send(file.data);
    } catch (err) {
        console.error('CV download error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch the CV.' });
    }
});

/**
 * Body copy for the outcome email.
 *
 * Only shortlisted and declined are announced. `pending` and `reviewed` are
 * internal triage states — telling an applicant "your application is now marked
 * reviewed" is noise, and worse, it starts a clock they will count.
 *
 * Shortlisted is deliberately not "accepted": it means the Cathedral wants to
 * meet them, and the email has to say what happens next or the applicant is
 * left waiting on a phone call nobody promised.
 */
function outcomeEmail(submission, note, interview = {}) {
    const name = escapeHtml(`${submission.firstName} ${submission.lastName}`.trim());
    const role = submission.opportunityRole ? escapeHtml(submission.opportunityRole) : '';
    const noteBlock = note
        ? `<div style="margin-top:16px;padding:14px;background:#fff;border-radius:8px;border:1px solid #e2e8f0;white-space:pre-wrap">${escapeHtml(note)}</div>`
        : '';

    if (submission.status === 'shortlisted') {
        const { date, time, location, contact } = interview;

        // A fixed appointment when staff supplied one, otherwise an instruction
        // to call and book. Never both, and never a blank "details to follow".
        const rows = [
            ['Date', date],
            ['Time', time],
            ['Where', location],
        ].filter(([, v]) => v);

        const scheduling = rows.length
            ? `<p>Your interview is scheduled as follows:</p>
               <table style="width:100%;border-collapse:collapse;margin-top:8px;background:#fff;border:1px solid #e2e8f0;border-radius:8px">
                 ${rows.map(([k, v]) => `<tr><td style="padding:10px 14px;color:#64748b;width:32%">${escapeHtml(k)}</td><td style="padding:10px 14px;font-weight:600">${escapeHtml(v)}</td></tr>`).join('')}
               </table>
               <p style="margin-top:16px">If that time does not suit you, please reply to this email or call the Cathedral office${contact ? ` on <strong>${escapeHtml(contact)}</strong>` : ''} and we will arrange another.</p>`
            : `<p><strong>To arrange your interview</strong>, please reply to this email or call the Cathedral office${contact ? ` on <strong>${escapeHtml(contact)}</strong>` : ''} within the next seven days, and we will agree a time that suits you.</p>
               <p>Office hours are Monday to Friday, 8:00am – 5:00pm.</p>`;

        return {
            subject: role
                ? `Interview invitation — ${submission.opportunityRole}, ACK Mombasa Memorial Cathedral`
                : 'Interview invitation — ACK Mombasa Memorial Cathedral',
            html: churchLayout(
                'You Have Been Shortlisted',
                `<p>Dear <strong>${name}</strong>,</p>
                 <p>Thank you for your application${role ? ` for <strong>${role}</strong>` : ''}. We are glad to tell you that you have been <strong>shortlisted</strong>, and we would like to invite you to an interview.</p>
                 ${scheduling}
                 <p style="margin-top:16px">Please bring your national ID and the originals of any certificates referred to in your application.</p>
                 ${noteBlock}
                 <p style="margin-top:24px">God bless you,<br/><strong>ACK Mombasa Memorial Cathedral</strong></p>`,
                'You can reply to this email and it will reach the Cathedral office.'
            ),
        };
    }

    return {
        subject: role
            ? `Your application for ${submission.opportunityRole} — ACK Mombasa Memorial Cathedral`
            : 'Your application — ACK Mombasa Memorial Cathedral',
        html: churchLayout(
            'About Your Application',
            `<p>Dear <strong>${name}</strong>,</p>
             <p>Thank you for your interest in serving with us and for the time you put into your application${role ? ` for <strong>${role}</strong>` : ''}. After prayerful consideration we are not able to take it forward on this occasion.</p>
             <p>We would warmly encourage you to apply again for future opportunities, and you remain very welcome among us.</p>
             ${noteBlock}
             <p style="margin-top:24px">God bless you,<br/><strong>ACK Mombasa Memorial Cathedral</strong></p>`,
            'You can reply to this email and it will reach the Cathedral office.'
        ),
    };
}

// PATCH /api/get-involved/:id/status — update status (admin only)
//
// Optionally notifies the applicant. The client must ask for it explicitly via
// `notify`, so that changing a status while tidying the list never fires an
// irreversible email at a real person.
router.patch('/:id/status', auth, async (req, res) => {
    const { status, notify, note, interview } = req.body;
    if (!['pending', 'reviewed', 'shortlisted', 'declined'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }
    try {
        const submission = await GetInvolvedSubmission.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });

        // The status change is already saved, so a mail failure is reported
        // without rolling it back — staff would otherwise click again and again
        // against an outage they cannot fix.
        let notified = false;
        let notifyError = null;
        const announceable = status === 'shortlisted' || status === 'declined';

        if (notify && announceable && submission.email) {
            const { subject, html } = outcomeEmail(submission, note, interview || {});
            try {
                await sendEmail({ to: submission.email, subject, html, replyTo: OFFICE });
                submission.notifiedAt = new Date();
                submission.notifiedStatus = status;
                await submission.save();
                notified = true;
            } catch (mailErr) {
                console.error('Application outcome email failed:', mailErr.message);
                notifyError = mailErr.message;
            }
        }

        // Worth an audit entry even when no email went: "who declined this
        // applicant, and when" is a question the church will eventually ask.
        logActivity({
            actor: req.cmsUser,
            action: notified ? 'notify' : 'update',
            section: 'get-involved',
            itemId: submission._id.toString(),
            label: `${submission.firstName} ${submission.lastName} → ${status}${notified ? ' (applicant emailed)' : ''}`,
        });

        res.json({ success: true, submission, notified, notifyError });
    } catch (err) {
        console.error('Status update error:', err);
        res.status(500).json({ success: false, message: 'Failed to update status.' });
    }
});

// DELETE /api/get-involved/:id — delete a submission (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const removed = await GetInvolvedSubmission.findByIdAndDelete(req.params.id);
        // The CV goes with the application. Leaving an applicant's personal
        // details behind after their record is deleted is the whole reason
        // these files stopped living in Cloudinary.
        if (removed?.cvFileId) {
            await ApplicationFile.deleteOne({ _id: removed.cvFileId });
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete submission.' });
    }
});

module.exports = router;
