const mongoose = require('mongoose');

/**
 * A single line in the Cathedral's manual financial record.
 *
 * Deliberately manual and deliberately separate from the M-Pesa and Pesapal
 * code: this is a book the treasurer keeps, not a transaction log. Payments
 * that arrive through the website are not written here automatically, because a
 * ledger that half-reconciles itself is harder to trust than one that does not
 * pretend to.
 *
 * There is NO TTL index here. CmsActivity expires by design; financial records
 * do not. This is the one place that convention is intentionally not copied.
 */
const ledgerEntrySchema = new mongoose.Schema(
    {
        date: { type: Date, required: true, index: true },
        type: { type: String, enum: ['income', 'expense'], required: true },
        // Free text rather than an enum: the categories a church actually uses
        // shift with the year's projects, and a fixed list would send everything
        // to "Other" within a season. The UI suggests the giving categories.
        category: { type: String, required: true, trim: true, maxlength: 80 },
        // Kenyan shillings, stored as entered. Guarded at zero so a negative
        // amount cannot be used to disguise an expense as income.
        amount: { type: Number, required: true, min: 0 },
        description: { type: String, trim: true, maxlength: 500, default: '' },
        // M-Pesa code, cheque number, invoice reference — whatever ties the line
        // back to a document someone can produce during an audit.
        reference: { type: String, trim: true, maxlength: 120, default: '' },
        method: {
            type: String,
            enum: ['mpesa', 'bank', 'cash', 'cheque', 'other'],
            default: 'other',
        },
        // Denormalised on purpose: the name must survive the CMS account being
        // deleted, or a five-year-old entry loses its author.
        recordedBy: {
            id: { type: String, default: null },
            name: { type: String, default: 'Unknown' },
        },
    },
    { timestamps: true }
);

ledgerEntrySchema.methods.toJSONSafe = function toJSONSafe() {
    return {
        id: this._id.toString(),
        date: this.date ? this.date.toISOString().split('T')[0] : '',
        type: this.type,
        category: this.category,
        amount: this.amount,
        description: this.description,
        reference: this.reference,
        method: this.method,
        recordedByName: this.recordedBy?.name || 'Unknown',
        createdAt: this.createdAt,
    };
};

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);
