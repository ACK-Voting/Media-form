const { Resend } = require('resend');

/**
 * Generic email sender for the church website.
 *
 * `utils/email.js` holds seven bespoke media-team templates and its only
 * primitive is a private, unexported shim — and its default From address reads
 * "ACK Mombasa Media Team", which is wrong for cathedral correspondence. This
 * is the church-side equivalent: one function, branded for the Cathedral,
 * used by inbox notifications and contact replies.
 */

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM
  || `ACK Mombasa Memorial Cathedral <${process.env.EMAIL_USER}>`;

/** Where staff notifications go. */
const OFFICE = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

const CHURCH_URL = (process.env.CHURCH_URL || 'http://localhost:3001').replace(/\/$/, '');

/**
 * Sends an email. Throws on failure so the caller can decide whether that
 * matters — a contact reply must surface the error, a background notification
 * should swallow it.
 */
async function sendEmail({ to, subject, html, replyTo, bcc }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Email is not configured (RESEND_API_KEY is not set).');
  }
  const recipients = Array.isArray(to) ? to : [to];
  if (!recipients.length || !recipients[0]) {
    throw new Error('No recipient address.');
  }

  const payload = {
    from: FROM,
    to: recipients,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
    ...(bcc?.length ? { bcc: Array.isArray(bcc) ? bcc : [bcc] } : {}),
  };

  const { data, error } = await resend.emails.send(payload);
  if (error) throw new Error(error.message || JSON.stringify(error));
  return { messageId: data?.id };
}

/** Cathedral-branded wrapper, matching the look of the existing emails. */
function churchLayout(heading, bodyHtml, footerNote = '') {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
      <div style="background:#1e3a8a;padding:28px;text-align:center;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">ACK Mombasa Memorial Cathedral</h1>
        <p style="color:#bfdbfe;margin:6px 0 0;font-size:14px">${heading}</p>
      </div>
      <div style="background:#f8fafc;padding:28px;border-radius:0 0 12px 12px;line-height:1.6">
        ${bodyHtml}
        ${footerNote ? `<p style="margin-top:28px;color:#64748b;font-size:12px">${footerNote}</p>` : ''}
      </div>
    </div>
  `;
}

/**
 * Tells the office something arrived. Never throws — a visitor's prayer request
 * must be saved whether or not Resend is reachable.
 */
function notifyOffice({ heading, subject, rows, body }) {
  const table = (rows || [])
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 0;color:#64748b;width:34%">${k}</td><td style="padding:6px 0;font-weight:600">${v}</td></tr>`)
    .join('');

  const html = churchLayout(
    heading,
    `${table ? `<table style="width:100%;border-collapse:collapse">${table}</table>` : ''}
     ${body ? `<div style="margin-top:16px;padding:14px;background:#fff;border-radius:8px;border:1px solid #e2e8f0;white-space:pre-wrap">${body}</div>` : ''}
     <p style="margin-top:24px"><a href="${CHURCH_URL}/cms" style="display:inline-block;background:#1e3a8a;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600">Open the CMS</a></p>`,
    'You are receiving this because you are listed as the Cathedral office contact.'
  );

  return sendEmail({ to: OFFICE, subject, html })
    .catch((err) => console.error(`Office notification failed (${subject}):`, err.message));
}

module.exports = { sendEmail, churchLayout, notifyOffice, FROM, OFFICE, CHURCH_URL };
