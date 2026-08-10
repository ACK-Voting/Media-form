const mongoose = require('mongoose');

// One collection for all editable website content.
//
// Each document is a single item (one leader, one event, one gallery photo) so
// that two admins editing the same section don't overwrite each other, and so
// ministry scoping can be enforced per item. Sections that are genuinely one
// object (giving details, contact info, home page copy) use the reserved
// itemId '_singleton' and the `version` field for optimistic locking.
//
// `data` is deliberately unstructured: it holds exactly the shape the matching
// frontend store already used, so the TypeScript types in the frontend remain
// the single definition of each content type. The router applies a per-section
// key allowlist before writing.

const SINGLETON_ID = '_singleton';

const contentItemSchema = new mongoose.Schema(
  {
    section: { type: String, required: true, index: true },
    itemId: { type: String, required: true },
    ministrySlug: { type: String, default: null },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    version: { type: Number, default: 0 },
    updatedBy: {
      id: { type: String, default: null },
      name: { type: String, default: null },
    },
  },
  { timestamps: true }
);

contentItemSchema.index({ section: 1, itemId: 1 }, { unique: true });
contentItemSchema.index({ section: 1, ministrySlug: 1 });

// Shape returned to the frontend: the stored `data` plus the id the stores key
// on, so a store can drop the response straight into its array.
contentItemSchema.methods.toContent = function toContent() {
  return {
    ...(this.data || {}),
    id: this.itemId,
    ...(this.ministrySlug ? { ministrySlug: this.ministrySlug } : {}),
    published: this.published,
    updatedAt: this.updatedAt,
    updatedBy: this.updatedBy?.name || null,
  };
};

module.exports = mongoose.model('ContentItem', contentItemSchema);
module.exports.SINGLETON_ID = SINGLETON_ID;
