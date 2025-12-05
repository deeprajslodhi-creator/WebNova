/**
 * Seed Admin User
 * Creates an admin user for initial setup
 * Run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({
            email: process.env.ADMIN_EMAIL || 'admin@storage.com'
        });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            email: process.env.ADMIN_EMAIL || 'admin@storage.com',
            password: process.env.ADMIN_PASSWORD || 'Admin@123456',
            role: 'admin',
            storageLimit: 1073741824 // 1GB for admin
        });

        console.log('✅ Admin user created successfully');
        console.log(`📧 Email: ${admin.email}`);
        console.log(`🔑 Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
        console.log('\n⚠️  Please change the admin password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
