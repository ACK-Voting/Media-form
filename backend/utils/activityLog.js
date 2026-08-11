const CmsActivity = require('../models/CmsActivity');

/**
 * Records a CMS action.
 *
 * Deliberately fire-and-forget and never throws: an audit trail that can break
 * a save is worse than no audit trail. Failures are logged to the server
 * console so they are still visible.
 */
function logActivity({ actor, action, section, itemId, label, changes }) {
  CmsActivity.create({
    actorId: actor?.id ?? null,
    actorName: actor?.name || 'Unknown',
    actorRole: actor?.role ?? null,
    action,
    section: section ?? null,
    itemId: itemId ?? null,
    label: label ?? '',
    changes: changes ?? [],
  }).catch((err) => {
    console.error('Activity log write failed:', err.message);
  });
}

/**
 * Best-effort human label for a content item, so the log reads
 * "Rev. Duncan Nondi" rather than an opaque id.
 */
function labelFor(data, fallback) {
  if (!data || typeof data !== 'object') return fallback ?? '';
  return (
    data.title || data.name || data.caption || data.feature ||
    data.role || data.subject || fallback || ''
  );
}

/** Top-level field names that differ between two objects. */
function changedFields(before = {}, after = {}) {
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  const changed = [];
  for (const k of keys) {
    if (JSON.stringify(before?.[k]) !== JSON.stringify(after?.[k])) changed.push(k);
  }
  return changed;
}

module.exports = { logActivity, labelFor, changedFields };
