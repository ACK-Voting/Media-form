const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.EMAIL_FROM || `ACK Mombasa Memorial Cathedral <${process.env.EMAIL_USER}>`;
const LOGIN_URL = (process.env.FRONTEND_URL || 'http://localhost:3001') + '/cms/login';

const ROLE_LABELS = {
  super_admin:    'Super Admin',
  church_admin:   'Church Admin',
  ministry_admin: 'Ministry Admin',
};

const validation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').trim().notEmpty().withMessage('Password is required'),
  body('role').isIn(['super_admin', 'church_admin', 'ministry_admin']).withMessage('Invalid role'),
];

// POST /api/invite  — send CMS account credentials to a new user
router.post('/', validation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, username, password, role } = req.body;
  const roleLabel = ROLE_LABELS[role] || role;

  try {
    await resend.emails.send({
      from: FROM,
      to: [email],
      subject: 'Your ACK Mombasa Memorial Cathedral CMS Account',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
          <div style="background:#1e3a8a;padding:32px;text-align:center;border-radius:12px 12px 0 0">
            <h1 style="color:white;margin:0;font-size:22px">ACK Mombasa Memorial Cathedral</h1>
            <p style="color:#bfdbfe;margin:8px 0 0">Website CMS — Account Created</p>
          </div>
          <div style="background:#f8fafc;padding:32px;border-radius:0 0 12px 12px">
            <p>Hi <strong>${name}</strong>,</p>
            <p>An account has been created for you on the ACK Mombasa Memorial Cathedral website CMS with the role of <strong>${roleLabel}</strong>.</p>
            <p>Use the credentials below to log in:</p>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:20px 0">
              <table style="width:100%;border-collapse:collapse">
                <tr>
                  <td style="padding:6px 0;color:#64748b;width:35%">Username</td>
                  <td style="padding:6px 0;font-weight:600;font-family:monospace">${username}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#64748b">Password</td>
                  <td style="padding:6px 0;font-weight:600;font-family:monospace">${password}</td>
                </tr>
              </table>
            </div>
            <div style="text-align:center;margin:28px 0">
              <a href="${LOGIN_URL}" style="display:inline-block;background:#1e3a8a;color:#fff;font-weight:700;font-size:15px;padding:14px 36px;border-radius:10px;text-decoration:none">
                Log In to CMS
              </a>
            </div>
            <p style="color:#ef4444;font-size:13px">For security, please change your password after your first login.</p>
            <p style="margin-top:32px">God bless you,<br/><strong>ACK Mombasa Memorial Cathedral</strong></p>
          </div>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Invite email error:', err);
    res.status(500).json({ success: false, message: 'Failed to send invitation email.' });
  }
});

module.exports = router;
