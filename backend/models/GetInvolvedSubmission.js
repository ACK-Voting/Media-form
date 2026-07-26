const mongoose = require('mongoose');

const getInvolvedSubmissionSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, trim: true, lowercase: true },
    phone:     { type: String, required: true, trim: true },
    address:   { type: String, trim: true },
    type:      { type: String, enum: ['membership', 'volunteer'], required: true },
    baptized:       { type: String, trim: true },
    confirmed:      { type: String, trim: true },
    previousChurch: { type: String, trim: true },
    ministries: [{ type: String }],
    message:   { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GetInvolvedSubmission', getInvolvedSubmissionSchema);
