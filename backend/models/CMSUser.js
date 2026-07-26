const mongoose = require('mongoose');

const cmsUserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false }, // bcrypt hash — never returned by default
  role: { type: String, enum: ['super_admin', 'church_admin', 'ministry_admin'], required: true },
  ministryAccess: [{ type: String }],
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('CMSUser', cmsUserSchema);
