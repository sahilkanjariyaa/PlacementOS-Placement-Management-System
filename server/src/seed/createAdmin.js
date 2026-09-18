import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

const createAdmin = async () => {
  const args = process.argv.slice(2);
  const name = args[0] || 'Placement Officer';
  const email = args[1];

  if (!email) {
    console.error('\n❌ Error: Please provide an email address for the new admin.');
    console.log('Usage: node src/seed/createAdmin.js "<Admin Name>" "<admin_email@example.com>"');
    console.log('Example: node src/seed/createAdmin.js "Dr. Rajesh Kumar" "rajesh.kumar@college.edu"\n');
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    console.log('\n[Admin Provisioning] Connecting to MongoDB...');
    await connectDB();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`\nℹ️  User "${normalizedEmail}" is ALREADY registered as an ACTIVE ADMIN (${existingUser.name}).`);
        console.log('You can log in directly at http://localhost:5173/login under the "Admin / Officer" tab.\n');
        process.exit(0);
      } else {
        console.error(`\n❌ Error: Email "${normalizedEmail}" is already registered as a ${existingUser.role.toUpperCase()}.`);
        console.error('An email cannot be used across multiple roles. Please provide a different email address.\n');
        process.exit(1);
      }
    }

    const newAdmin = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      role: 'admin',
      isActive: true,
    });

    console.log('===============================================================');
    console.log('✅ NEW ADMIN PROVISIONED SUCCESSFULLY!');
    console.log('---------------------------------------------------------------');
    console.log(`👨‍💼 Name:  ${newAdmin.name}`);
    console.log(`📧 Email: ${newAdmin.email}`);
    console.log(`🛡️ Role:  ADMIN (Placement Officer)`);
    console.log('---------------------------------------------------------------');
    console.log('👉 To Sign In:');
    console.log('   1. Navigate to: http://localhost:5173/login');
    console.log('   2. Select the "👨‍💼 Admin / Officer" tab');
    console.log(`   3. Enter email: ${newAdmin.email}`);
    console.log('   4. Verify with the 6-digit real-time OTP sent to your email/console');
    console.log('===============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to provision admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
