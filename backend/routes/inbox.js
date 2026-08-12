const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const InboxMessage = require('../models/InboxMessage');
const { requireCMSUser, requireSection } = require('../middleware/cmsAuth');
const { notifyOffice } = require('../utils/mailer');

// The inverse of /api/content: writing is public, reading requires staff auth.

const KINDS = { prayer: 'prayer-requests', contact: 'contacts' };

// The global limiter allows 1000 requests per 15 minutes, which is far too
// loose for an unauthenticated write. Without a tight limit here the inbox
// fills with spam within days and staff stop reading it — which quietly undoes
// the point of having the forms work at all.
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function kindParam(req, res, next) {
  if (!KINDS[req.params.kind]) {
    return res.status(404).json({ success: false, message: 'Unknown inbox' });
  }
  next();
}

/* ---------------------------------------------------------------- public -- */

const submitValidation = [
  body('name').trim().notEmpty().isLength({ max: 120 }).withMessage('Name is required'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Valid email required'),
  body('website').isEmpty().withMessage('Rejected'), // honeypot: bots fill it, humans never see it
];

// POST /api/inbox/:kind
router.post('/:kind', kindParam, submitLimiter, submitValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { kind } = req.params;
  const { name, email, phone, subject, message, request, isAnonymous, shareable } = req.body;

  if (kind === 'prayer' && !String(request || '').trim()) {
    return res.status(400).json({ success: false, message: 'Prayer request cannot be empty.' });
  }
  if (kind === 'contact' && !String(message || '').trim()) {
    return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
  }

  try {
    const saved = await InboxMessage.create({
      kind,
      name: isAnonymous ? 'Anonymous' : name,
      email: email || '',
      phone: phone || '',
      subject: subject || '',
      message: message || '',
      request: request || '',
      isAnonymous: !!isAnonymous,
      shareable: !!shareable,
    });

    // Tell the office. Deliberately not awaited: nothing about a mail outage
    // should stop a prayer request being recorded, and the visitor has already
    // done their part.
    if (kind === 'prayer') {
      notifyOffice({
        heading: 'New Prayer Request',
        subject: `New prayer request${saved.isAnonymous ? '' : ` from ${saved.name}`}`,
        rows: [
          ['From', saved.isAnonymous ? 'Anonymous' : saved.name],
          ['Email', saved.isAnonymous ? '' : saved.email],
          ['Share publicly', saved.shareable ? 'Yes' : 'No'],
        ],
        body: saved.request,
      });
    } else {
      notifyOffice({
        heading: 'New Contact Message',
        subject: `New message: ${saved.subject || 'Website enquiry'}`,
        rows: [
          ['From', saved.name],
          ['Email', saved.email],
          ['Phone', saved.phone],
          ['Subject', saved.subject],
        ],
        body: saved.message,
      });
    }
    // Deliberately no echo of the stored record — a public endpoint should not
    // confirm back what it saved about other people.
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Inbox submit error:', err);
    res.status(500).json({ success: false, message: 'Could not submit. Please try again.' });
  }
});

// GET /api/inbox/prayer/public — the prayer wall. Only requests whose sender
// ticked "share this with the congregation".
router.get('/prayer/public', async (req, res) => {
  try {
    const docs = await InboxMessage.find({ kind: 'prayer', shareable: true, archived: false })
      .sort({ createdAt: -1 })
      .limit(20);
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.json({ success: true, requests: docs.map((d) => d.toPublicPrayer()) });
  } catch (err) {
    console.error('Prayer wall error:', err);
    res.status(500).json({ success: false, message: 'Failed to load prayer requests.' });
  }
});

/* ------------------------------------------------------------------ staff -- */

// GET /api/inbox/:kind
router.get('/:kind', kindParam, requireCMSUser, (req, res, next) => {
  requireSection(KINDS[req.params.kind])(req, res, next);
}, async (req, res) => {
  try {
    const docs = await InboxMessage.find({ kind: req.params.kind, archived: false })
      .sort({ createdAt: -1 })
      .limit(500);
    res.json({ success: true, items: docs.map((d) => d.toAdmin()) });
  } catch (err) {
    console.error('Inbox fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to load messages.' });
  }
});

// PATCH /api/inbox/:kind/:id — toggle handled ("prayed for" / "read").
router.patch('/:kind/:id', kindParam, requireCMSUser, (req, res, next) => {
  requireSection(KINDS[req.params.kind])(req, res, next);
}, async (req, res) => {
  try {
    const update = {};
    if (req.body.handled !== undefined) update.handled = !!req.body.handled;
    if (req.body.archived !== undefined) update.archived = !!req.body.archived;

    const doc = await InboxMessage.findOneAndUpdate(
      { _id: req.params.id, kind: req.params.kind },
      { $set: update },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, item: doc.toAdmin() });
  } catch (err) {
    console.error('Inbox update error:', err);
    res.status(400).json({ success: false, message: 'Failed to update message.' });
  }
});

// DELETE /api/inbox/:kind/:id
router.delete('/:kind/:id', kindParam, requireCMSUser, (req, res, next) => {
  requireSection(KINDS[req.params.kind])(req, res, next);
}, async (req, res) => {
  try {
    const doc = await InboxMessage.findOneAndDelete({ _id: req.params.id, kind: req.params.kind });
    if (!doc) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('Inbox delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
});

module.exports = router;
