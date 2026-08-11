const express = require('express');
const router = express.Router();

const CmsActivity = require('../models/CmsActivity');
const { requireCMSUser } = require('../middleware/cmsAuth');

/**
 * GET /api/cms-activity
 *
 * Query: ?limit=&skip=&action=&section=&actor=
 *
 * Super admins and church admins see everything. A ministry admin sees only
 * their own actions — the log is an accountability record, not a way to watch
 * colleagues.
 */
router.get('/', requireCMSUser, async (req, res) => {
  try {
    const { action, section, actor } = req.query;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const skip = Math.max(Number(req.query.skip) || 0, 0);

    const filter = {};
    if (req.cmsUser.role === 'ministry_admin') {
      filter.actorId = req.cmsUser.id;
    } else if (actor) {
      filter.actorId = actor;
    }
    if (action) filter.action = action;
    if (section) filter.section = section;

    const [items, total] = await Promise.all([
      CmsActivity.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      CmsActivity.countDocuments(filter),
    ]);

    res.json({
      success: true,
      items: items.map((i) => i.toJSONSafe()),
      total,
      hasMore: skip + items.length < total,
    });
  } catch (err) {
    console.error('Activity fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to load activity.' });
  }
});

module.exports = router;
