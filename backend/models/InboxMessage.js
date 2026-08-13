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
    // Vestigial: the public prayer wall was removed and prayer requests are now
    // unconditionally confidential. Kept on the schema so existing documents
    // still load cleanly, but nothing reads it and the submit route forces it
    // false for prayer.
    shareable: { type: Boolean, default: false },
    // The form has always offered "I'd like a follow-up from the pastoral
    // team" and always thrown the answer away. Staff need to see it to act on
    // it, so it is stored and surfaced in the CMS.
    receiveFollowUp: { type: Boolean, default: false },

    // An array rather than a repliedAt flag: staff will sometimes follow up
    // twice, and a boolean loses the second conversation entirely.
    replies: [
      {
        body: { type: String, required: true, maxlength: 5000 },
        sentByName: { type: String, default: '' },
        sentById: { type: String, default: '' },
        sentAt: { type: Date, default: Date.now },
      },
    ],

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
    return {
      ...base,
      request: this.request,
      isAnonymous: this.isAnonymous,
      receiveFollowUp: this.receiveFollowUp,
      prayedFor: this.handled,
    };
  }
  return {
    ...base,
    phone: this.phone,
    subject: this.subject,
    message: this.message,
    read: this.handled,
    replies: (this.replies || []).map((r) => ({
      body: r.body,
      sentByName: r.sentByName,
      sentAt: r.sentAt ? r.sentAt.toISOString() : '',
    })),
  };
};

module.exports = mongoose.model('InboxMessage', inboxMessageSchema);
