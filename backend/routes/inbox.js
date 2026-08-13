const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const InboxMessage = require('../models/InboxMessage');
const { requireCMSUser, requireSection } = require('../middleware/cmsAuth');
const { notifyOffice, sendEmail, churchLayout, escapeHtml, OFFICE } = require('../utils/mailer');
const { logActivity } = require('../utils/activityLog');

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

/**
 * Tells the sender their prayer request arrived.
 *
 * Until now someone submitting a prayer request heard nothing at all once they
 * closed the tab — the office was told, the sender was not. Anyone who left an
 * address gets this; there is no opt-in, because an acknowledgement of your own
 * message is not marketing.
 *
 * Never awaited and never throws: a Resend outage must not cost someone their
 * prayer request, and the request is already saved by the time this runs.
 */
function acknowledgePrayer(saved) {
  if (!saved.email) return;

  const greeting = saved.isAnonymous ? 'Dear friend' : `Dear ${escapeHtml(saved.name)}`;
  const followUp = saved.receiveFollowUp
    ? '<p>You asked to hear from the pastoral team, and someone will be in touch with you directly.</p>'
    : '';

  const html = churchLayout(
    'Your Prayer Request Has Been Received',
    `<p>${greeting},</p>
     <p>Thank you for entrusting us with your prayer request. Our intercessory team has received it and will be praying for you.</p>
     ${followUp}
     <div style="margin-top:16px;padding:14px;background:#fff;border-radius:8px;border:1px solid #e2e8f0">
       <p style="margin:0 0 6px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em">What you shared</p>
       <div style="white-space:pre-wrap">${escapeHtml(saved.request)}</div>
     </div>
     <p style="margin-top:24px">&ldquo;Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.&rdquo; — Philippians 4:6</p>
     <p style="margin-top:24px">God bless you,<br/><strong>ACK Mombasa Memorial Cathedral</strong></p>`,
    'Your request is confidential and is seen only by the Cathedral prayer team. It is never published.'
  );

  sendEmail({
    to: saved.email,
    subject: 'We have received your prayer request — ACK Mombasa Memorial Cathedral',
    html,
  }).catch((err) => console.error('Prayer acknowledgement failed:', err.message));
}

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
  const { name, email, phone, subject, message, request, isAnonymous, shareable, receiveFollowUp } = req.body;

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
      // Prayer requests are confidential to the prayer team, without exception.
      // The public wall is gone, so this is forced false rather than read from
      // the body — an old cached page or a hand-rolled request must not be able
      // to opt someone's prayer need into being published.
      shareable: kind === 'prayer' ? false : !!shareable,
      receiveFollowUp: !!receiveFollowUp,
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
          ['Wants pastoral follow-up', saved.receiveFollowUp ? 'Yes' : ''],
        ],
        body: saved.request,
      });
      acknowledgePrayer(saved);
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

// The public prayer wall used to live here. It was removed deliberately: a
// prayer request is pastoral correspondence, and publishing any of it — even
// with consent captured through a checkbox — invites regret that the church
// then has to undo by hand. There is now no public read path for this inbox at
// all, which is a stronger guarantee than "shareable defaults to false".

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

// POST /api/inbox/:kind/:id/reply — answer a message from inside the CMS.
//
// Replying used to be a mailto: link, which meant the answer left from whichever
// personal account the staff member happened to be signed into, with no record
// on the message that anyone had responded. This sends from the Cathedral
// address with reply-to pointed at the office, and records what was said.
router.post('/:kind/:id/reply', kindParam, requireCMSUser, (req, res, next) => {
  requireSection(KINDS[req.params.kind])(req, res, next);
}, async (req, res) => {
  const body = String(req.body.body || '').trim();
  if (!body) {
    return res.status(400).json({ success: false, message: 'Reply cannot be empty.' });
  }
  if (body.length > 5000) {
    return res.status(400).json({ success: false, message: 'Reply is too long.' });
  }

  try {
    const doc = await InboxMessage.findOne({ _id: req.params.id, kind: req.params.kind });
    if (!doc) return res.status(404).json({ success: false, message: 'Message not found.' });
    if (!doc.email) {
      return res.status(400).json({ success: false, message: 'This message has no email address to reply to.' });
    }

    const original = doc.kind === 'prayer' ? doc.request : doc.message;
    const html = churchLayout(
      doc.subject ? `Re: ${escapeHtml(doc.subject)}` : 'A Reply From the Cathedral Office',
      `<p>Dear ${escapeHtml(doc.isAnonymous ? 'friend' : doc.name || 'friend')},</p>
       <div style="white-space:pre-wrap">${escapeHtml(body)}</div>
       <p style="margin-top:24px">God bless you,<br/><strong>ACK Mombasa Memorial Cathedral</strong></p>
       <div style="margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px">
         <p style="margin:0 0 6px">In reply to your message of ${new Date(doc.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}:</p>
         <div style="white-space:pre-wrap;font-style:italic">${escapeHtml(original)}</div>
       </div>`,
      'You can reply directly to this email and it will reach the Cathedral office.'
    );

    // Send first, record second. The reverse order — which routes/getInvolved.js
    // and routes/invite.js both use — can leave the CMS showing a reply that
    // never actually left the building, which is worse than an error on screen.
    await sendEmail({
      to: doc.email,
      subject: doc.subject ? `Re: ${doc.subject}` : 'A reply from ACK Mombasa Memorial Cathedral',
      html,
      replyTo: OFFICE,
    });

    doc.replies.push({
      body,
      sentByName: req.cmsUser?.name || 'Unknown',
      sentById: req.cmsUser?.id || '',
    });
    doc.handled = true;
    await doc.save();

    logActivity({
      actor: req.cmsUser,
      action: 'reply',
      section: KINDS[req.params.kind],
      itemId: doc._id.toString(),
      label: doc.subject || doc.name,
    });

    res.json({ success: true, item: doc.toAdmin() });
  } catch (err) {
    console.error('Inbox reply error:', err);
    // Surfaces the real reason — "Email is not configured", a rejected address —
    // because the staff member needs to know the message did not go.
    res.status(502).json({ success: false, message: err.message || 'Could not send the reply.' });
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
