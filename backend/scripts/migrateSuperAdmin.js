/**
 * Run once to upgrade all existing admins with no role to 'super_admin'.
 * After this, new admins created via the portal will default to 'admin'.
 *
 * Usage: node scripts/migrateSuperAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const result = await Admin.updateMany(
    { role: { $exists: false } },
    { $set: { role: 'super_admin' } }
  );

  console.log(`✅ Upgraded ${result.modifiedCount} admin(s) to super_admin.`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
