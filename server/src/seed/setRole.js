import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Company } from '../models/Company.js';
import mongoose from 'mongoose';

const setRole = async () => {
  const args = process.argv.slice(2);
  const email = args[0];
  const targetRole = args[1] ? args[1].toLowerCase().trim() : 'student';

  if (!email) {
    console.error('\n❌ Error: Please provide the email address to update.');
    console.log('Usage: npm run set-role -- <email> <student|admin|recruiter>');
    console.log('Example: npm run set-role -- sahilkanjariya15@gmail.com student\n');
    process.exit(1);
  }

  if (!['student', 'admin', 'recruiter'].includes(targetRole)) {
    console.error(`\n❌ Error: Invalid role "${targetRole}". Must be one of: student, admin, recruiter\n`);
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    console.log(`\n[Role Switcher] Connecting to MongoDB...`);
    await connectDB();

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log(`[Role Switcher] No user found with "${normalizedEmail}". Creating fresh ${targetRole.toUpperCase()} account...`);
      user = await User.create({
        name: normalizedEmail.split('@')[0].replace(/[._]/g, ' '),
        email: normalizedEmail,
        role: targetRole,
        isActive: true,
      });
    } else {
      const oldRole = user.role;
      user.role = targetRole;
      await user.save();
      console.log(`[Role Switcher] Changed role for "${normalizedEmail}" from ${oldRole.toUpperCase()} to ${targetRole.toUpperCase()}.`);
    }

    // If student role, guarantee StudentProfile exists
    if (targetRole === 'student') {
      let profile = await StudentProfile.findOne({ userId: user._id });
      if (!profile) {
        const yearPrefix = new Date().getFullYear().toString().slice(-2);
        const enrollmentSuffix = Math.floor(1000 + Math.random() * 9000);
        profile = await StudentProfile.create({
          userId: user._id,
          enrollmentNo: `STU${yearPrefix}CSE${enrollmentSuffix}`,
          department: 'Computer Science',
          semester: 8,
          cgpa: 8.5,
          backlogs: 0,
          phone: '9876543210',
          skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python'],
          placementStatus: 'unplaced',
        });
        console.log(`[Role Switcher] Initialized Student Academic Profile (${profile.enrollmentNo}, CGPA: 8.5, Computer Science).`);
      }
    }

    // If recruiter role, guarantee company association
    if (targetRole === 'recruiter' && !user.companyId) {
      let company = await Company.findOne({ isActive: true });
      if (!company) {
        company = await Company.create({
          name: 'TechNova Solutions',
          industry: 'Technology & Software',
          location: 'Bengaluru, India',
          website: 'https://technova.example.com',
          hrName: user.name,
          hrEmail: normalizedEmail,
          isActive: true,
        });
      }
      user.companyId = company._id;
      await user.save();
      console.log(`[Role Switcher] Associated recruiter with company "${company.name}".`);
    }

    console.log('===============================================================');
    console.log('✅ USER ROLE CONFIGURED SUCCESSFULLY!');
    console.log('---------------------------------------------------------------');
    console.log(`👤 Name:  ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🛡️ Active Role: ${user.role.toUpperCase()}`);
    console.log('---------------------------------------------------------------');
    console.log('👉 To Sign In:');
    console.log(`   1. Open: http://localhost:5173/login`);
    console.log(`   2. Click the "${user.role === 'student' ? '🎓 Student' : user.role === 'admin' ? '👨‍💼 Admin / Officer' : '🏢 Recruiter'}" tab`);
    console.log(`   3. Enter: ${user.email}`);
    console.log('   4. Verify with the 6-digit real-time OTP sent to your email');
    console.log('===============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Role switch failed:', error.message);
    process.exit(1);
  }
};

setRole();
