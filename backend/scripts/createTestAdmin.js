require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function createTestAdmin() {
  try {
    console.log('📝 Creating Test Admin Account...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test admin credentials
    const username = 'admin';
    const email = 'admin@ack.com';
    const password = 'admin123';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      console.log(`Username: ${existingAdmin.username}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log('\nYou can login with the existing credentials.');
      process.exit(0);
    }

    // Create admin
    const admin = new Admin({
      username,
      email,
      password
    });

    await admin.save();

    console.log('✅ Test Admin account created successfully!\n');
    console.log('Login Credentials:');
    console.log('─────────────────────────────');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('─────────────────────────────');
    console.log('\nYou can now login at: admin-login.html');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createTestAdmin();
