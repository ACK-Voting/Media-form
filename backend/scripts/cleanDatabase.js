require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const cleanDatabase = async () => {
    try {
        console.log('⚠️  DATABASE CLEANUP UTILITY');
        console.log('Connecting to MongoDB...');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        rl.question('🔥 ARE YOU SURE? This will PERMANENTLY DELETE all data in the database (y/N): ', async (answer) => {
            if (answer.toLowerCase() === 'y') {
                console.log('🗑️  Dropping database...');
                await mongoose.connection.db.dropDatabase();
                console.log('✅ Database dropped successfully!');
                console.log('\nNext steps:');
                console.log('1. Run "npm run seed" to restore initial roles');
                console.log('2. Run "node scripts/createAdmin.js" to create a new admin account');
            } else {
                console.log('❌ Cleanup cancelled.');
            }

            await mongoose.disconnect();
            rl.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        process.exit(1);
    }
};

cleanDatabase();
