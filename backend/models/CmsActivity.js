const mongoose = require('mongoose');

/**
 * Audit trail for the website CMS.
 *
 * ContentItem records only who last touched a document, which answers "who
 * broke this?" but not "what changed last Tuesday?". This is the append-only
 * history: one row per action, never edited afterwards.
 *
 * Separate from AdminActivity, which belongs to the media-team app and tracks a
 * different set of users entirely.
 */
const cmsActivitySchema = new mongoose.Schema(
  {
    // Denormalised on purpose: the log must still read correctly after an
    // account is renamed or deleted.
    actorId: { type: String, default: null },
    actorName: { type: String, required: true },
    actorRole: { type: String, default: null },

    action: {
      type: String,
      required: true,
      enum: [
        'create', 'update', 'delete', 'publish', 'unpublish',
        'login', 'user_create', 'user_update', 'user_delete', 'invite',
        // Outbound mail. These matter more than the content actions above —
        // they are the entries that answer "who told this applicant they were
        // declined?" and "who sent that bulletin?".
        'reply', 'send', 'notify',
      ],
      index: true,
    },

    // Content section ('events', 'leadership'), or 'cms-users' / 'auth'.
    section: { type: String, default: null, index: true },
    itemId: { type: String, default: null },

    // Human-readable name of the thing acted on, captured at the time so the
    // log stays meaningful even after the item is deleted.
    label: { type: String, default: '' },

    /** Field names touched by an update — enough to see what changed. */
    changes: [{ type: String }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

cmsActivitySchema.index({ createdAt: -1 });
// Keep a year of history; without this the collection grows forever.
cmsActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

cmsActivitySchema.methods.toJSONSafe = function toJSONSafe() {
  return {
    id: this._id.toString(),
    actorName: this.actorName,
    actorRole: this.actorRole,
    action: this.action,
    section: this.section,
    itemId: this.itemId,
    label: this.label,
    changes: this.changes ?? [],
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('CmsActivity', cmsActivitySchema);
