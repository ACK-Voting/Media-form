const mongoose = require('mongoose');

const getInvolvedSubmissionSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, trim: true, lowercase: true },
    phone:     { type: String, required: true, trim: true },
    address:   { type: String, trim: true },
    // 'application' is someone applying to a specific listed opportunity;
    // it shares this collection so staff have one inbox rather than two.
    type:      { type: String, enum: ['membership', 'volunteer', 'application'], required: true },
    opportunityId:   { type: String, trim: true },
    opportunityRole: { type: String, trim: true },
    coverLetter:     { type: String, trim: true, maxlength: 5000 },
    // CV attached to a job application. Optional by design: a required upload
    // on a phone with a patchy connection loses applicants.
    cvUrl:      { type: String, trim: true, default: '' },
    cvFileName: { type: String, trim: true, default: '', maxlength: 200 },
    cvFileType: { type: String, trim: true, default: '' },
    baptized:       { type: String, trim: true },
    confirmed:      { type: String, trim: true },
    previousChurch: { type: String, trim: true },
    ministries: [{ type: String }],
    message:   { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'declined'],
      default: 'pending',
    },
    // When the applicant was last told the outcome, and which outcome they were
    // told. Without this the CMS cannot show whether someone already has their
    // answer, and a second staff member sends a duplicate.
    notifiedAt: { type: Date, default: null },
    notifiedStatus: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GetInvolvedSubmission', getInvolvedSubmissionSchema);
