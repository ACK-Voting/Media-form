const mongoose = require('mongoose');

/**
 * A bulletin or announcement sent to the subscriber list.
 *
 * Stored rather than fired and forgotten so staff can see what has already gone
 * out and to how many people — without it, the only record of a send is in
 * someone's memory, and the second person to look reasonably sends it again.
 */
const bulletinSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 20000 },

    status: {
      type: String,
      enum: ['draft', 'sending', 'sent', 'failed'],
      default: 'draft',
      index: true,
    },

    sentAt: { type: Date, default: null },
    // Counted from what Resend actually accepted, not from the size of the
    // list, so a partial failure is visible rather than reported as success.
    recipientCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    error: { type: String, default: '' },

    createdByName: { type: String, default: '' },
    createdById: { type: String, default: '' },
  },
  { timestamps: true }
);

bulletinSchema.index({ createdAt: -1 });

bulletinSchema.methods.toAdmin = function toAdmin() {
  return {
    id: this._id.toString(),
    subject: this.subject,
    body: this.body,
    status: this.status,
    sentAt: this.sentAt ? this.sentAt.toISOString() : null,
    recipientCount: this.recipientCount,
    failedCount: this.failedCount,
    error: this.error,
    createdByName: this.createdByName,
    date: this.createdAt ? this.createdAt.toISOString().split('T')[0] : '',
  };
};

module.exports = mongoose.model('Bulletin', bulletinSchema);
