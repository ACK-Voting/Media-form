require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const CMSUser = require('../models/CMSUser');

// Creates the first CMS super admin. Replaces the old boot-time seed, which
// created six accounts sharing one hardcoded password.
//
//   SEED_ADMIN_NAME='Jane Doe' SEED_ADMIN_EMAIL=jane@example.org \
//   SEED_ADMIN_USERNAME=jane SEED_ADMIN_PASSWORD='...' npm run seed:admin
//
// Pass --reset-password to change an existing account's password instead.

async function seedSuperAdmin() {
  const name = process.env.SEED_ADMIN_NAME;
  const email = process.env.SEED_ADMIN_EMAIL;
  const username = process.env.SEED_ADMIN_USERNAME?.toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const resetPassword = process.argv.includes('--reset-password');

  const missing = [
    !name && 'SEED_ADMIN_NAME',
    !email && 'SEED_ADMIN_EMAIL',
    !username && 'SEED_ADMIN_USERNAME',
    !password && 'SEED_ADMIN_PASSWORD',
  ].filter(Boolean);

  if (missing.length) {
    console.error(`❌ Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (password.length < 12) {
    console.error('❌ SEED_ADMIN_PASSWORD must be at least 12 characters.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const hash = await bcrypt.hash(password, 10);
    const existing = await CMSUser.findOne({ username });

    if (existing) {
      if (!resetPassword) {
        console.error(`❌ User "${username}" already exists. Re-run with --reset-password to change it.`);
        process.exit(1);
      }
      existing.password = hash;
      existing.role = 'super_admin';
      existing.active = true;
      await existing.save();
      console.log(`✅ Password reset for existing super admin "${username}"`);
    } else {
      await CMSUser.create({
        name, email, username,
        password: hash,
        role: 'super_admin',
        ministryAccess: [],
        active: true,
      });
      console.log(`✅ Super admin "${username}" created`);
    }

    const total = await CMSUser.countDocuments();
    if (total > 1) {
      console.log(`\n⚠️  ${total} CMS accounts exist. If any predate this script they may`);
      console.log('   still use the old shared seed password — rotate them in /cms/users.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedSuperAdmin();
