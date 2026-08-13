const mongoose = require('mongoose');

/**
 * A CV attached to a job application, stored as bytes in MongoDB.
 *
 * These used to live in Cloudinary, which was wrong for two reasons. The
 * practical one: Cloudinary blocks PDF delivery by default, so every uploaded CV
 * returned 401 and staff could not open a single one. The more important one: a
 * Cloudinary delivery URL is unauthenticated, so anybody holding the link could
 * read an applicant's home address, phone number and employment history. Here
 * the bytes are only reachable through GET /api/get-involved/:id/cv, which
 * requires a CMS session.
 *
 * Kept in its own collection rather than as a field on the submission so that
 * listing applications in the CMS never drags megabytes of file data along with
 * it.
 */
const applicationFileSchema = new mongoose.Schema(
    {
        data: { type: Buffer, required: true },
        contentType: { type: String, required: true },
        fileName: { type: String, required: true, trim: true, maxlength: 200 },
        size: { type: Number, required: true },
        // Set to +24h on upload and unset once the file is attached to a
        // submitted application. Mongo's TTL monitor deletes documents whose
        // date has passed and ignores documents where the field is absent, so a
        // CV chosen by someone who then abandoned the form cleans itself up
        // without a cron job.
        expiresAt: { type: Date, default: null },
    },
    { timestamps: true }
);

applicationFileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ApplicationFile', applicationFileSchema);
