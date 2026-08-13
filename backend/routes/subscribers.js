const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const Subscriber = require('../models/Subscriber');
const Bulletin = require('../models/Bulletin');
const { requireCMSUser, requireSection } = require('../middleware/cmsAuth');
const { logActivity } = require('../utils/activityLog');
const {
  sendEmail, sendBulk, churchLayout, escapeHtml, OFFICE, CHURCH_URL,
} = require('../utils/mailer');

const staff = [requireCMSUser, requireSection('bulletins')];

// Same shape as /api/inbox: subscribing is an unauthenticated write, so it gets
// a tight per-IP limit and a honeypot rather than relying on the global 1000.
const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function unsubscribeUrl(token) {
  return `${CHURCH_URL}/unsubscribe?token=${token}`;
}

/**
 * The unsubscribe footer, appended to every bulletin.
 *
 * Non-negotiable on bulk mail: without a working one-click opt-out the church's
 * domain gets marked as a spam source, which would also take down the
 * transactional email everything else here depends on.
 */
function unsubscribeFooter(token) {
  return `You are receiving this because you subscribed to the ACK Mombasa Memorial Cathedral bulletin.
    <a href="${unsubscribeUrl(token)}" style="color:#64748b">Unsubscribe</a>.`;
}

/* ---------------------------------------------------------------- public -- */

// POST /api/subscribers — join the bulletin list.
router.post(
  '/',
  subscribeLimiter,
  [
    body('email').trim().isEmail().withMessage('A valid email address is required'),
    body('website').isEmpty().withMessage('Rejected'), // honeypot
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const email = String(req.body.email).trim().toLowerCase();
    const name = String(req.body.name || '').trim().slice(0, 120);

    try {
      let subscriber = await Subscriber.findOne({ email });

      if (subscriber) {
        // Already on the list. Re-subscribing reactivates a previous opt-out,
        // which is the person's own choice to make. The response is identical
        // either way so the endpoint cannot be used to test who is subscribed.
        if (!subscriber.active) {
          subscriber.active = true;
          subscriber.unsubscribedAt = null;
          if (name) subscriber.name = name;
          await subscriber.save();
        }
      } else {
        subscriber = await Subscriber.create({ email, name });
      }

      // Confirms to the sender that it worked, and — more usefully — gives them
      // a way straight back out if someone else typed their address in.
      sendEmail({
        to: email,
        subject: 'You are subscribed to the Cathedral bulletin',
        replyTo: OFFICE,
        html: churchLayout(
          'Subscription Confirmed',
          `<p>${name ? `Dear <strong>${escapeHtml(name)}</strong>,` : 'Hello,'}</p>
           <p>Thank you for subscribing. You will now receive our weekly bulletin and
              announcements about upcoming events at ACK Mombasa Memorial Cathedral.</p>
           <p style="margin-top:24px">God bless you,<br/><strong>ACK Mombasa Memorial Cathedral</strong></p>`,
          `If you did not sign up, you can
           <a href="${unsubscribeUrl(subscriber.unsubscribeToken)}" style="color:#64748b">remove this address</a>
           immediately.`
        ),
      }).catch((err) => console.error('Subscriber confirmation failed:', err.message));

      res.status(201).json({ success: true });
    } catch (err) {
      console.error('Subscribe error:', err);
      res.status(500).json({ success: false, message: 'Could not subscribe. Please try again.' });
    }
  }
);

// POST /api/subscribers/unsubscribe — one click, no login, no confirmation step.
//
// Deliberately not a GET: mail clients and security scanners pre-fetch links,
// which would unsubscribe people who never clicked. The public /unsubscribe
// page posts here on load instead.
router.post('/unsubscribe', async (req, res) => {
  const token = String(req.body.token || '').trim();
  if (!token) return res.status(400).json({ success: false, message: 'Missing token.' });

  try {
    const subscriber = await Subscriber.findOne({ unsubscribeToken: token });
    // An unknown token still reports success: someone clicking unsubscribe twice
    // should see "you're unsubscribed", not an error implying they are still on
    // the list.
    if (subscriber && subscriber.active) {
      subscriber.active = false;
      subscriber.unsubscribedAt = new Date();
      await subscriber.save();
    }
    res.json({ success: true, email: subscriber?.email ?? '' });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).json({ success: false, message: 'Could not process the request.' });
  }
});

/* ----------------------------------------------------------------- staff -- */

// GET /api/subscribers
router.get('/', staff, async (req, res) => {
  try {
    const docs = await Subscriber.find().sort({ createdAt: -1 }).limit(5000);
    res.json({
      success: true,
      items: docs.map((d) => d.toAdmin()),
      activeCount: docs.filter((d) => d.active).length,
    });
  } catch (err) {
    console.error('Subscriber list error:', err);
    res.status(500).json({ success: false, message: 'Failed to load subscribers.' });
  }
});

// DELETE /api/subscribers/:id — remove an address entirely, e.g. on request.
router.delete('/:id', staff, async (req, res) => {
  try {
    const doc = await Subscriber.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Subscriber not found.' });
    logActivity({
      actor: req.cmsUser, action: 'delete', section: 'bulletins',
      itemId: req.params.id, label: doc.email,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Subscriber delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete subscriber.' });
  }
});

// GET /api/subscribers/bulletins — what has been sent.
router.get('/bulletins/all', staff, async (req, res) => {
  try {
    const docs = await Bulletin.find().sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, items: docs.map((d) => d.toAdmin()) });
  } catch (err) {
    console.error('Bulletin list error:', err);
    res.status(500).json({ success: false, message: 'Failed to load bulletins.' });
  }
});

// POST /api/subscribers/bulletins/send — compose and send to the active list.
router.post('/bulletins/send', staff, async (req, res) => {
  const subject = String(req.body.subject || '').trim();
  const bodyText = String(req.body.body || '').trim();

  if (!subject) return res.status(400).json({ success: false, message: 'Subject is required.' });
  if (!bodyText) return res.status(400).json({ success: false, message: 'Message is required.' });
  if (bodyText.length > 20000) {
    return res.status(400).json({ success: false, message: 'Message is too long.' });
  }

  let bulletin;
  try {
    const recipients = await Subscriber.find({ active: true });
    if (!recipients.length) {
      return res.status(400).json({ success: false, message: 'There are no active subscribers to send to.' });
    }

    // Recorded before sending, so a crash mid-send leaves evidence that a send
    // was attempted rather than no trace at all.
    bulletin = await Bulletin.create({
      subject,
      body: bodyText,
      status: 'sending',
      createdByName: req.cmsUser?.name || 'Unknown',
      createdById: req.cmsUser?.id || '',
    });

    const messages = recipients.map((r) => ({
      to: r.email,
      subject,
      replyTo: OFFICE,
      html: churchLayout(
        'Cathedral Bulletin',
        `<div style="white-space:pre-wrap">${escapeHtml(bodyText)}</div>
         <p style="margin-top:24px">God bless you,<br/><strong>ACK Mombasa Memorial Cathedral</strong></p>`,
        unsubscribeFooter(r.unsubscribeToken)
      ),
    }));

    const { sent, failed, errors } = await sendBulk(messages);

    bulletin.status = failed && !sent ? 'failed' : 'sent';
    bulletin.sentAt = new Date();
    bulletin.recipientCount = sent;
    bulletin.failedCount = failed;
    bulletin.error = errors.slice(0, 3).join('; ');
    await bulletin.save();

    logActivity({
      actor: req.cmsUser, action: 'send', section: 'bulletins',
      itemId: bulletin._id.toString(),
      label: `${subject} (${sent} sent${failed ? `, ${failed} failed` : ''})`,
    });

    res.json({ success: true, bulletin: bulletin.toAdmin() });
  } catch (err) {
    console.error('Bulletin send error:', err);
    if (bulletin) {
      bulletin.status = 'failed';
      bulletin.error = err.message;
      await bulletin.save().catch(() => {});
    }
    res.status(500).json({ success: false, message: err.message || 'Failed to send the bulletin.' });
  }
});

module.exports = router;
