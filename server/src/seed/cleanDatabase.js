import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Company } from '../models/Company.js';
import { Drive } from '../models/Drive.js';
import { Application } from '../models/Application.js';
import { Announcement } from '../models/Announcement.js';
import { Notification } from '../models/Notification.js';
import { OTPVerification } from '../models/OTPVerification.js';
import { env } from '../config/env.js';

const cleanDatabase = async () => {
  try {
    console.log('\n===============================================================');
    console.log('🧹 PURGING ALL DEMO & MOCK DATA FROM DATABASE');
    console.log('===============================================================\n');

    console.log('[CleanDB] Connecting to MongoDB...');
    await connectDB();

    console.log('[CleanDB] Wiping all existing collections...');
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.drop();
      console.log(`  ✓ Dropped collection: ${collection.collectionName}`);
    }

    // Determine admin email from env or default real admin
    const adminEmail = (env.GMAIL_USER && !env.GMAIL_USER.includes('your_') ? env.GMAIL_USER : 'sahilkanjariya15@gmail.com').toLowerCase().trim();

    console.log(`\n[CleanDB] Initializing Real Master Admin Account: ${adminEmail}...`);
    const adminUser = await User.create({
      name: 'Sahil Kanjariya',
      email: adminEmail,
      role: 'admin',
      isActive: true,
    });

    console.log('\n===============================================================');
    console.log('✨ DATABASE CLEANED & INITIALIZED WITH 0 DEMO DATA!');
    console.log('---------------------------------------------------------------');
    console.log('🛡️  Master Admin Created:');
    console.log(`   - Name:  ${adminUser.name}`);
    console.log(`   - Email: ${adminUser.email}`);
    console.log(`   - Role:  ADMIN (Placement Officer)`);
    console.log('---------------------------------------------------------------');
    console.log('📊 Empty Collections Initialized:');
    console.log('   - 0 Dummy Students (Students register via /register)');
    console.log('   - 0 Dummy Companies (Recruiters register via /register or Admin adds them)');
    console.log('   - 0 Dummy Drives');
    console.log('   - 0 Dummy Applications');
    console.log('   - 0 Dummy Announcements');
    console.log('===============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Clean database failed:', error.message);
    process.exit(1);
  }
};

cleanDatabase();
