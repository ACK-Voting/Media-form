const express = require('express');
const router = express.Router();

const InboxMessage = require('../models/InboxMessage');
const GetInvolvedSubmission = require('../models/GetInvolvedSubmission');
const { requireCMSUser } = require('../middleware/cmsAuth');

/**
 * GET /api/cms-counts
 *
 * Outstanding-item counts for the CMS sidebar badges. One small request instead
 * of loading three full stores on every page just to render a number — these
 * are `countDocuments` on indexed fields, not document fetches.
 */
router.get('/', requireCMSUser, async (req, res) => {
  try {
    const [contacts, prayers, applications, submissions] = await Promise.all([
      InboxMessage.countDocuments({ kind: 'contact', handled: false, archived: false }),
      InboxMessage.countDocuments({ kind: 'prayer', handled: false, archived: false }),
      GetInvolvedSubmission.countDocuments({ type: 'application', status: 'pending' }),
      GetInvolvedSubmission.countDocuments({ type: { $ne: 'application' }, status: 'pending' }),
    ]);

    res.json({
      success: true,
      counts: { contacts, prayers, applications, submissions },
    });
  } catch (err) {
    console.error('CMS counts error:', err);
    // A failed badge count must not look like a broken page — return zeros.
    res.json({ success: true, counts: { contacts: 0, prayers: 0, applications: 0, submissions: 0 } });
  }
});

module.exports = router;
