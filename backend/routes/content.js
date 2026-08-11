const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const ContentItem = require('../models/ContentItem');
const { SINGLETON_ID } = require('../models/ContentItem');
const {
  SECTIONS, PUBLIC_SECTIONS, isSection, isSingleton, sanitize, stripReserved,
} = require('../config/contentSections');
const { requireCMSUser, requireSection, checkItemScope } = require('../middleware/cmsAuth');
const { logActivity, labelFor, changedFields } = require('../utils/activityLog');

// max-age=0 so a browser always revalidates: an admin who saves an edit and
// then opens the public site must see their change, not a minute-old copy they
// would read as a failed save. s-maxage still lets the CDN absorb visitor
// traffic, and stale-while-revalidate keeps that refresh off the critical path.
const PUBLIC_CACHE = 'public, max-age=0, s-maxage=30, stale-while-revalidate=300';

function sectionParam(req, res, next) {
  if (!isSection(req.params.section)) {
    return res.status(404).json({ success: false, message: 'Unknown content section' });
  }
  next();
}

function shape(docs, section) {
  if (isSingleton(section)) {
    const doc = docs[0];
    return doc ? { ...(doc.data || {}), version: doc.version } : null;
  }
  return docs.map((d) => d.toContent());
}

/* ---------------------------------------------------------------- public -- */

// GET /api/content — the whole site in one request, so the frontend bootstraps
// with a single round trip instead of fifteen.
router.get('/', async (req, res) => {
  try {
    const docs = await ContentItem.find({ section: { $in: PUBLIC_SECTIONS } })
      .sort({ section: 1, order: 1, createdAt: 1 });

    const sections = {};
    for (const name of PUBLIC_SECTIONS) {
      sections[name] = isSingleton(name) ? null : [];
    }
    const grouped = {};
    for (const doc of docs) {
      (grouped[doc.section] ||= []).push(doc);
    }
    for (const [name, list] of Object.entries(grouped)) {
      sections[name] = shape(list, name);
    }

    res.set('Cache-Control', PUBLIC_CACHE);
    res.json({ success: true, sections });
  } catch (err) {
    console.error('Content fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to load content.' });
  }
});

// GET /api/content/:section
router.get('/:section', sectionParam, async (req, res) => {
  const { section } = req.params;
  if (!SECTIONS[section].public) {
    return res.status(404).json({ success: false, message: 'Unknown content section' });
  }
  try {
    const docs = await ContentItem.find({ section }).sort({ order: 1, createdAt: 1 });
    res.set('Cache-Control', PUBLIC_CACHE);
    res.json({ success: true, section, items: shape(docs, section) });
  } catch (err) {
    console.error('Content fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to load content.' });
  }
});

/* ----------------------------------------------------------------- write -- */

function editor(req) {
  return { id: req.cmsUser.id, name: req.cmsUser.name };
}

// POST /api/content/:section — create one item.
router.post('/:section', sectionParam, requireCMSUser, (req, res, next) => {
  requireSection(req.params.section)(req, res, next);
}, async (req, res) => {
  const { section } = req.params;
  if (isSingleton(section)) {
    return res.status(405).json({ success: false, message: 'Use PUT for this section' });
  }
  try {
    const incomingSlug = req.body.ministrySlug ?? null;
    const scope = checkItemScope(req.cmsUser, section, null, incomingSlug);
    if (!scope.ok) return res.status(403).json({ success: false, message: scope.message });

    const data = sanitize(stripReserved(req.body.data || {}));
    const itemId = String(req.body.itemId || crypto.randomUUID());

    const doc = await ContentItem.create({
      section,
      itemId,
      ministrySlug: incomingSlug,
      order: req.body.order ?? 0,
      published: req.body.published ?? true,
      data,
      updatedBy: editor(req),
    });
    logActivity({
      actor: req.cmsUser, action: 'create', section, itemId,
      label: labelFor(data),
    });
    res.status(201).json({ success: true, item: doc.toContent() });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'An item with that id already exists.' });
    }
    console.error('Content create error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to create item.' });
  }
});

// PATCH /api/content/:section/:itemId — shallow-merge into `data`.
router.patch('/:section/:itemId', sectionParam, requireCMSUser, (req, res, next) => {
  requireSection(req.params.section)(req, res, next);
}, async (req, res) => {
  const { section, itemId } = req.params;
  try {
    const existing = await ContentItem.findOne({ section, itemId });
    if (!existing) return res.status(404).json({ success: false, message: 'Item not found.' });

    const incomingSlug = req.body.ministrySlug;
    const scope = checkItemScope(req.cmsUser, section, existing, incomingSlug);
    if (!scope.ok) return res.status(403).json({ success: false, message: scope.message });

    const before = { ...(existing.data || {}) };
    const wasPublished = existing.published;

    if (req.body.data) {
      existing.data = { ...(existing.data || {}), ...sanitize(stripReserved(req.body.data)) };
      existing.markModified('data');
    }
    if (incomingSlug !== undefined) existing.ministrySlug = incomingSlug;
    if (req.body.published !== undefined) existing.published = !!req.body.published;
    if (req.body.order !== undefined) existing.order = req.body.order;
    existing.updatedBy = editor(req);

    await existing.save();

    // A publish/unpublish is the change staff care about most, so it gets its
    // own action rather than being buried in a field list.
    const publishToggled = req.body.published !== undefined && wasPublished !== existing.published;
    logActivity({
      actor: req.cmsUser,
      action: publishToggled ? (existing.published ? 'publish' : 'unpublish') : 'update',
      section, itemId,
      label: labelFor(existing.data, itemId),
      changes: changedFields(before, existing.data),
    });

    res.json({ success: true, item: existing.toContent() });
  } catch (err) {
    console.error('Content update error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to update item.' });
  }
});

// DELETE /api/content/:section/:itemId, or ?ids=a,b,c for a bulk delete.
router.delete('/:section/:itemId?', sectionParam, requireCMSUser, (req, res, next) => {
  requireSection(req.params.section)(req, res, next);
}, async (req, res) => {
  const { section } = req.params;
  const ids = req.query.ids
    ? String(req.query.ids).split(',').map((s) => s.trim()).filter(Boolean)
    : [req.params.itemId].filter(Boolean);

  if (!ids.length) {
    return res.status(400).json({ success: false, message: 'No item id supplied.' });
  }

  try {
    const docs = await ContentItem.find({ section, itemId: { $in: ids } });
    for (const doc of docs) {
      const scope = checkItemScope(req.cmsUser, section, doc, undefined);
      if (!scope.ok) return res.status(403).json({ success: false, message: scope.message });
    }
    const result = await ContentItem.deleteMany({ section, itemId: { $in: ids } });
    // Labels are read before deletion — afterwards there is nothing to name.
    for (const doc of docs) {
      logActivity({
        actor: req.cmsUser, action: 'delete', section,
        itemId: doc.itemId, label: labelFor(doc.data, doc.itemId),
      });
    }
    res.json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    console.error('Content delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete item.' });
  }
});

// PUT /api/content/:section — replace a singleton.
//
// Requires the version the client last read. Two admins editing the same page
// would otherwise silently overwrite each other; instead the second save gets a
// 409 with the current server state so the UI can offer to reload it.
router.put('/:section', sectionParam, requireCMSUser, (req, res, next) => {
  requireSection(req.params.section)(req, res, next);
}, async (req, res) => {
  const { section } = req.params;
  if (!isSingleton(section)) {
    return res.status(405).json({ success: false, message: 'Use POST/PATCH for this section' });
  }
  try {
    const data = sanitize(stripReserved(req.body.data || {}));
    const expected = req.body.version;

    const existing = await ContentItem.findOne({ section, itemId: SINGLETON_ID });

    if (!existing) {
      const created = await ContentItem.create({
        section, itemId: SINGLETON_ID, data, version: 1, updatedBy: editor(req),
      });
      logActivity({ actor: req.cmsUser, action: 'create', section, itemId: SINGLETON_ID, label: section });
      return res.status(201).json({ success: true, data: created.data, version: created.version });
    }

    if (expected !== undefined && existing.version !== expected) {
      return res.status(409).json({
        success: false,
        message: 'Someone else saved this page while you were editing.',
        current: { ...(existing.data || {}), version: existing.version },
      });
    }

    const updated = await ContentItem.findOneAndUpdate(
      { section, itemId: SINGLETON_ID, version: existing.version },
      { $set: { data, updatedBy: editor(req) }, $inc: { version: 1 } },
      { new: true }
    );

    // Lost a race between the read above and this write.
    if (!updated) {
      const current = await ContentItem.findOne({ section, itemId: SINGLETON_ID });
      return res.status(409).json({
        success: false,
        message: 'Someone else saved this page while you were editing.',
        current: { ...(current?.data || {}), version: current?.version },
      });
    }

    logActivity({
      actor: req.cmsUser, action: 'update', section, itemId: SINGLETON_ID,
      label: section,
      changes: changedFields(existing.data, updated.data),
    });
    res.json({ success: true, data: updated.data, version: updated.version });
  } catch (err) {
    console.error('Content save error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to save.' });
  }
});

module.exports = router;
