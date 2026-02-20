require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('📝 Creating Admin Account...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin details
    const username = await question('Enter admin username: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }]
    });

    if (existingAdmin) {
      console.log('\n❌ Admin with this username or email already exists!');
      process.exit(1);
    }

    // Create admin
    const admin = new Admin({
      username,
      email,
      password
    });

    await admin.save();

    console.log('\n✅ Admin account created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log('\nYou can now login at: admin-login.html');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdmin();
