const mongoose = require('mongoose');

// Messages the public sends in: prayer requests and contact-form enquiries.
//
// Kept in its own collection rather than alongside ContentItem so that the
// public content endpoint physically cannot return them, whatever a future
// section registry says.

const inboxMessageSchema = new mongoose.Schema(
  {
    kind: { type: String, required: true, enum: ['prayer', 'contact'], index: true },

    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, maxlength: 200, default: '' },
    phone: { type: String, trim: true, maxlength: 40, default: '' },

    // contact only
    subject: { type: String, trim: true, maxlength: 200, default: '' },
    message: { type: String, trim: true, maxlength: 5000, default: '' },

    // prayer only
    request: { type: String, trim: true, maxlength: 5000, default: '' },
    isAnonymous: { type: Boolean, default: false },
    // Whether the request may be shown on the public prayer wall. Anonymous
    // requests are never surfaced with a name attached.
    shareable: { type: Boolean, default: false },

    handled: { type: Boolean, default: false },  // "prayed for" / "read"
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

inboxMessageSchema.index({ kind: 1, createdAt: -1 });

function isoDate(d) {
  return d ? d.toISOString().split('T')[0] : '';
}

// Full record, for authenticated CMS staff.
inboxMessageSchema.methods.toAdmin = function toAdmin() {
  const base = {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    date: isoDate(this.createdAt),
    handled: this.handled,
  };
  if (this.kind === 'prayer') {
    return { ...base, request: this.request, isAnonymous: this.isAnonymous, prayedFor: this.handled };
  }
  return { ...base, phone: this.phone, subject: this.subject, message: this.message, read: this.handled };
};

// Redacted record for the public prayer wall: no email, and no name unless the
// sender both opted into sharing and did not ask to be anonymous.
inboxMessageSchema.methods.toPublicPrayer = function toPublicPrayer() {
  return {
    id: this._id.toString(),
    name: this.isAnonymous ? 'Anonymous' : this.name,
    request: this.request,
    date: isoDate(this.createdAt),
    prayedFor: this.handled,
  };
};

module.exports = mongoose.model('InboxMessage', inboxMessageSchema);
