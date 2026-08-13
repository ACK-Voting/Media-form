const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Someone who asked to receive the weekly bulletin and event announcements.
 *
 * Until now "Subscribe" on /events filed an ordinary contact message saying
 * "so-and-so asked to receive the bulletin", which staff had to read and act on
 * by hand — and there was nothing to send to them with anyway.
 *
 * No TTL index: unlike the activity log, a mailing list is not disposable.
 */
const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: { type: String, trim: true, default: '', maxlength: 120 },

    // Unsubscribing must work from a link in an email, where there is no
    // session — so the link carries a secret that is unguessable and specific
    // to one subscriber. An email address alone would let anyone remove anyone.
    unsubscribeToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => crypto.randomBytes(24).toString('hex'),
    },

    // Kept rather than deleted, so a later re-subscribe does not silently
    // resurrect someone who asked to be left alone, and so staff can see that
    // an address opted out rather than wondering why it vanished.
    active: { type: Boolean, default: true, index: true },
    unsubscribedAt: { type: Date, default: null },

    source: { type: String, default: 'events-page' },
  },
  { timestamps: true }
);

subscriberSchema.methods.toAdmin = function toAdmin() {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    active: this.active,
    date: this.createdAt ? this.createdAt.toISOString().split('T')[0] : '',
    unsubscribedAt: this.unsubscribedAt ? this.unsubscribedAt.toISOString() : null,
  };
};

module.exports = mongoose.model('Subscriber', subscriberSchema);
