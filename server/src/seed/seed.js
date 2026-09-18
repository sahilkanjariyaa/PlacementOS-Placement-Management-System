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

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Purging existing database collections & indexes...');
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.drop();
    }

    console.log('[Seed] Creating Corporate Partner Companies...');
    const companies = await Company.create([
      {
        name: 'TechNova Solutions',
        industry: 'Cloud & SaaS Platform',
        website: 'https://technova.example.com',
        location: 'Bengaluru, Karnataka',
        hrName: 'Ananya Deshmukh',
        hrEmail: 'hr@technova.example.com',
        isActive: true,
      },
      {
        name: 'CloudScale Systems',
        industry: 'Fintech Infrastructure',
        website: 'https://cloudscale.example.com',
        location: 'Hyderabad, Telangana',
        hrName: 'Rohit Kulkarni',
        hrEmail: 'careers@cloudscale.example.com',
        isActive: true,
      },
      {
        name: 'CyberShield InfoSec',
        industry: 'Cybersecurity & Defense',
        website: 'https://cybershield.example.com',
        location: 'Pune, Maharashtra',
        hrName: 'Meera Nambiar',
        hrEmail: 'talent@cybershield.example.com',
        isActive: true,
      },
      {
        name: 'DataSync Analytics',
        industry: 'Big Data & Enterprise Analytics',
        website: 'https://datasync.example.com',
        location: 'Gurugram, Haryana',
        hrName: 'Vikramaditya Roy',
        hrEmail: 'jobs@datasync.example.com',
        isActive: true,
      },
      {
        name: 'Apex Innovations',
        industry: 'Full Stack Product Engineering',
        website: 'https://apexinnovations.example.com',
        location: 'Noida, Uttar Pradesh',
        hrName: 'Priya Sundaram',
        hrEmail: 'recruitment@apexinnovations.example.com',
        isActive: true,
      },
    ]);

    console.log('[Seed] Creating Key System Users...');
    // 1. Admin / Placement Officer (Real Admin + Local Admin)
    const adminUser = await User.create({
      name: 'Sahil Kanjariya (Placement Head)',
      email: 'sahilkanjariya15@gmail.com',
      role: 'admin',
      isActive: true,
    });

    await User.create({
      name: 'Dr. Vikram Sethi (Placement Officer)',
      email: 'admin@placement.local',
      role: 'admin',
      isActive: true,
    });

    // 2. Primary Recruiter
    const recruiterUser = await User.create({
      name: 'Ananya Deshmukh',
      email: 'recruiter@placement.local',
      role: 'recruiter',
      companyId: companies[0]._id,
      isActive: true,
    });

    // 3. Primary Demo Student
    const primaryStudentUser = await User.create({
      name: 'Aarav Sharma',
      email: 'student@placement.local',
      role: 'student',
      isActive: true,
    });

    const primaryStudentProfile = await StudentProfile.create({
      userId: primaryStudentUser._id,
      enrollmentNo: 'STU24CSE001',
      department: 'Computer Science',
      semester: 8,
      cgpa: 8.75,
      backlogs: 0,
      phone: '9876543210',
      skills: ['JavaScript', 'React.js', 'Node.js', 'Express', 'MongoDB', 'Docker', 'RESTful APIs'],
      resumeUrl: 'https://example.com/resumes/aarav_sharma_resume.pdf',
      placementStatus: 'unplaced',
    });

    console.log('[Seed] Creating Cohort of 10 Diverse Students...');
    const studentsData = [
      {
        name: 'Diya Patel',
        email: 'diya.patel@placement.local',
        enrollmentNo: 'STU24CSE002',
        department: 'Computer Science',
        semester: 8,
        cgpa: 9.2,
        backlogs: 0,
        phone: '9876543211',
        skills: ['Python', 'Django', 'React.js', 'PostgreSQL', 'Machine Learning'],
        placementStatus: 'placed',
      },
      {
        name: 'Rohan Verma',
        email: 'rohan.verma@placement.local',
        enrollmentNo: 'STU24IT001',
        department: 'Information Technology',
        semester: 8,
        cgpa: 7.8,
        backlogs: 0,
        phone: '9876543212',
        skills: ['Java', 'Spring Boot', 'MySQL', 'React.js', 'AWS'],
        placementStatus: 'unplaced',
      },
      {
        name: 'Ishaan Gupta',
        email: 'ishaan.gupta@placement.local',
        enrollmentNo: 'STU24IT002',
        department: 'Information Technology',
        semester: 8,
        cgpa: 6.4,
        backlogs: 1,
        phone: '9876543213',
        skills: ['JavaScript', 'HTML5', 'CSS3', 'Node.js', 'Git'],
        placementStatus: 'unplaced',
      },
      {
        name: 'Sneha Kulkarni',
        email: 'sneha.kulkarni@placement.local',
        enrollmentNo: 'STU24ECE001',
        department: 'Electronics & Communication',
        semester: 8,
        cgpa: 8.4,
        backlogs: 0,
        phone: '9876543214',
        skills: ['C++', 'Embedded C', 'IoT', 'Python', 'MATLAB'],
        placementStatus: 'placed',
      },
      {
        name: 'Kabir Mehta',
        email: 'kabir.mehta@placement.local',
        enrollmentNo: 'STU24ECE002',
        department: 'Electronics & Communication',
        semester: 8,
        cgpa: 7.1,
        backlogs: 0,
        phone: '9876543215',
        skills: ['VLSI', 'Verilog', 'C++', 'Microcontrollers'],
        placementStatus: 'unplaced',
      },
      {
        name: 'Pooja Nair',
        email: 'pooja.nair@placement.local',
        enrollmentNo: 'STU24EEE001',
        department: 'Electrical Engineering',
        semester: 8,
        cgpa: 8.1,
        backlogs: 0,
        phone: '9876543216',
        skills: ['Power Systems', 'PLC/SCADA', 'MATLAB', 'AutoCAD Electrical'],
        placementStatus: 'placed',
      },
      {
        name: 'Aditya Singh',
        email: 'aditya.singh@placement.local',
        enrollmentNo: 'STU24MECH001',
        department: 'Mechanical Engineering',
        semester: 8,
        cgpa: 7.6,
        backlogs: 0,
        phone: '9876543217',
        skills: ['SolidWorks', 'ANSYS', 'AutoCAD', 'Python for Engineers', 'GD&T'],
        placementStatus: 'unplaced',
      },
      {
        name: 'Ananya Rao',
        email: 'ananya.rao@placement.local',
        enrollmentNo: 'STU24CIVIL001',
        department: 'Civil Engineering',
        semester: 8,
        cgpa: 8.6,
        backlogs: 0,
        phone: '9876543218',
        skills: ['STAAD Pro', 'Revit', 'AutoCAD Civil', 'Project Planning', 'GIS'],
        placementStatus: 'placed',
      },
      {
        name: 'Kunal Joshi',
        email: 'kunal.joshi@placement.local',
        enrollmentNo: 'STU24CSE003',
        department: 'Computer Science',
        semester: 8,
        cgpa: 8.9,
        backlogs: 0,
        phone: '9876543219',
        skills: ['Go', 'Kubernetes', 'Microservices', 'MongoDB', 'React'],
        placementStatus: 'placed',
      },
      {
        name: 'Tanvi Shah',
        email: 'tanvi.shah@placement.local',
        enrollmentNo: 'STU24IT003',
        department: 'Information Technology',
        semester: 8,
        cgpa: 7.2,
        backlogs: 0,
        phone: '9876543220',
        skills: ['UI/UX Design', 'Figma', 'React.js', 'Tailwind CSS', 'Next.js'],
        placementStatus: 'unplaced',
      },
    ];

    const studentProfilesList = [primaryStudentProfile];

    for (const item of studentsData) {
      const user = await User.create({
        name: item.name,
        email: item.email,
        role: 'student',
        isActive: true,
      });

      const profile = await StudentProfile.create({
        userId: user._id,
        enrollmentNo: item.enrollmentNo,
        department: item.department,
        semester: item.semester,
        cgpa: item.cgpa,
        backlogs: item.backlogs,
        phone: item.phone,
        skills: item.skills,
        placementStatus: item.placementStatus,
        resumeUrl: `https://example.com/resumes/${item.name.toLowerCase().replace(' ', '_')}.pdf`,
      });

      studentProfilesList.push(profile);
    }

    console.log('[Seed] Creating 8 Realistic Placement Drives...');
    const oneWeekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const expiredPastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const drives = await Drive.create([
      {
        companyId: companies[0]._id, // TechNova
        title: 'Full Stack MERN Developer',
        description:
          'Design and engineer high-scale React frontends and Node.js microservices. Collaborate with product teams to build multi-tenant SaaS architectures.',
        package: 14.5,
        location: 'Bengaluru (Hybrid)',
        jobType: 'full_time',
        deadline: oneWeekLater,
        minCgpa: 7.0,
        eligibleDepartments: ['Computer Science', 'Information Technology'],
        maxBacklogs: 0,
        eligibleSemesters: [7, 8],
        status: 'open',
        createdBy: adminUser._id,
      },
      {
        companyId: companies[1]._id, // CloudScale
        title: 'Backend Systems Engineer',
        description:
          'Build fault-tolerant distributed banking pipelines in Node.js, Go, and Redis. Work with high throughput event-driven microservices.',
        package: 18.0,
        location: 'Hyderabad (On-site)',
        jobType: 'full_time',
        deadline: twoWeeksLater,
        minCgpa: 7.5,
        eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics & Communication'],
        maxBacklogs: 0,
        eligibleSemesters: [7, 8],
        status: 'open',
        createdBy: adminUser._id,
      },
      {
        companyId: companies[2]._id, // CyberShield
        title: 'Security Operations & Network Analyst',
        description:
          'Monitor threat intelligence feeds, implement Zero Trust networking protocols, and evaluate security architectures.',
        package: 11.0,
        location: 'Pune (Hybrid)',
        jobType: 'full_time',
        deadline: oneWeekLater,
        minCgpa: 6.5,
        eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering'],
        maxBacklogs: 1,
        eligibleSemesters: [7, 8],
        status: 'open',
        createdBy: adminUser._id,
      },
      {
        companyId: companies[3]._id, // DataSync
        title: 'Data & Analytics Associate',
        description:
          'Build ETL pipelines using Python and Spark. Create actionable business intelligence dashboards and predictive statistical models.',
        package: 12.5,
        location: 'Gurugram (Hybrid)',
        jobType: 'full_time',
        deadline: twoWeeksLater,
        minCgpa: 7.0,
        eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics & Communication'],
        maxBacklogs: 0,
        eligibleSemesters: [7, 8],
        status: 'open',
        createdBy: adminUser._id,
      },
      {
        companyId: companies[4]._id, // Apex
        title: 'Associate Software Development Engineer (SDE-1)',
        description:
          'Join our core product team engineering responsive web applications, optimizing databases, and authoring unit/integration tests.',
        package: 9.5,
        location: 'Noida (On-site)',
        jobType: 'full_time',
        deadline: oneWeekLater,
        minCgpa: 6.0,
        eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'],
        maxBacklogs: 0,
        eligibleSemesters: [7, 8],
        status: 'open',
        createdBy: adminUser._id,
      },
      {
        companyId: companies[0]._id, // TechNova
        title: 'Cloud DevOps Intern',
        description:
          '6-month internship focused on CI/CD pipelines, Docker containerization, Kubernetes clusters, and Terraform infrastructure as code.',
        package: 6.0,
        location: 'Bengaluru (Remote)',
        jobType: 'internship',
        deadline: twoWeeksLater,
        minCgpa: 6.5,
        eligibleDepartments: ['Computer Science', 'Information Technology'],
        maxBacklogs: 1,
        eligibleSemesters: [6, 7, 8],
        status: 'open',
        createdBy: adminUser._id,
      },
      {
        companyId: companies[1]._id, // CloudScale
        title: 'Graduate Engineer Trainee (GET)',
        description:
          'Comprehensive training program across software testing, database administration, and cloud deployment operations.',
        package: 7.2,
        location: 'Hyderabad (On-site)',
        jobType: 'full_time',
        deadline: oneWeekLater,
        minCgpa: 6.0,
        eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering', 'Mechanical Engineering'],
        maxBacklogs: 0,
        eligibleSemesters: [7, 8],
        status: 'open',
        createdBy: adminUser._id,
      },
      {
        companyId: companies[4]._id, // Apex (Closed drive for test verification)
        title: 'Product Design & Frontend Trainee',
        description: 'Frontend role specializing in UI/UX architecture and web design.',
        package: 8.0,
        location: 'Noida',
        jobType: 'full_time',
        deadline: expiredPastDate,
        minCgpa: 6.0,
        eligibleDepartments: ['Computer Science', 'Information Technology'],
        maxBacklogs: 0,
        eligibleSemesters: [7, 8],
        status: 'closed',
        createdBy: adminUser._id,
      },
    ]);

    console.log('[Seed] Creating Active & Historical Applications with Multi-Stage Statuses...');
    await Application.create([
      // Diya Patel (Selected TechNova)
      {
        driveId: drives[0]._id,
        studentId: studentProfilesList[1]._id,
        status: 'selected',
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        remarks: 'Outstanding performance in technical and system design rounds. CTC 14.5 LPA offered.',
        resultDate: new Date(),
      },
      // Kunal Joshi (Selected CloudScale)
      {
        driveId: drives[1]._id,
        studentId: studentProfilesList[9]._id,
        status: 'selected',
        appliedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        remarks: 'Exceeded coding evaluation thresholds. Extended offer for Backend Systems Engineer.',
        resultDate: new Date(),
      },
      // Sneha Kulkarni (Selected CyberShield)
      {
        driveId: drives[2]._id,
        studentId: studentProfilesList[4]._id,
        status: 'selected',
        appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        remarks: 'Cleared security audit challenge and behavioral interview.',
        resultDate: new Date(),
      },
      // Pooja Nair (Selected Apex)
      {
        driveId: drives[4]._id,
        studentId: studentProfilesList[6]._id,
        status: 'selected',
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        remarks: 'Excellent problem solving skills. Selected for SDE-1 role.',
        resultDate: new Date(),
      },
      // Aarav Sharma (Primary student - In Interview stage for TechNova and Shortlisted for CloudScale)
      {
        driveId: drives[0]._id,
        studentId: primaryStudentProfile._id,
        status: 'interview',
        appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        remarks: 'Passed online assessment with 95% score. Final technical interview scheduled.',
      },
      {
        driveId: drives[1]._id,
        studentId: primaryStudentProfile._id,
        status: 'shortlisted',
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        remarks: 'Profile shortlisted based on academic CGPA and project portfolio.',
      },
      // Rohan Verma (Test round for TechNova)
      {
        driveId: drives[0]._id,
        studentId: studentProfilesList[2]._id,
        status: 'test',
        appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        remarks: 'Online assessment link dispatched via email.',
      },
      // Kabir Mehta (Applied for CyberShield)
      {
        driveId: drives[2]._id,
        studentId: studentProfilesList[5]._id,
        status: 'applied',
        appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        remarks: 'Application under screening.',
      },
      // Aditya Singh (Interview round for Apex)
      {
        driveId: drives[4]._id,
        studentId: studentProfilesList[7]._id,
        status: 'interview',
        appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        remarks: 'Technical evaluation round scheduled.',
      },
      // Tanvi Shah (Shortlisted for TechNova)
      {
        driveId: drives[0]._id,
        studentId: studentProfilesList[10]._id,
        status: 'shortlisted',
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        remarks: 'Shortlisted for technical round.',
      },
      // Ishaan Gupta (Rejected at TechNova due to backlogs screening in past)
      {
        driveId: drives[0]._id,
        studentId: studentProfilesList[3]._id,
        status: 'rejected',
        appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        remarks: 'Does not satisfy backlog requirements.',
        resultDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('[Seed] Creating College Announcements...');
    await Announcement.create([
      {
        title: 'Campus Recruitment Season 2026 Initiated',
        message:
          'Welcome students to the 2026 Campus Placement Season. Please ensure your academic dossier, CGPA, backlogs, and contact numbers are thoroughly updated in your profile before applying for active drives.',
        audience: 'all',
        publishedBy: adminUser._id,
        isPublished: true,
      },
      {
        title: 'Resume Review and Technical Mock Interview Workshop',
        message:
          'A specialized 2-day workshop on System Design, Data Structures, and behavioral interviews will be conducted by industry leaders this Saturday in Auditorium 2.',
        audience: 'student',
        publishedBy: adminUser._id,
        isPublished: true,
      },
      {
        title: 'Recruiter Guidelines & Campus Interview Protocol',
        message:
          'Partner corporate recruiters are requested to submit candidate shortlist updates and interview slots 24 hours in advance to streamline campus logistics.',
        audience: 'recruiter',
        publishedBy: adminUser._id,
        isPublished: true,
      },
    ]);

    console.log('[Seed] Creating Notifications...');
    await Notification.create([
      {
        userId: primaryStudentUser._id,
        title: 'Interview Scheduled',
        message: 'Your final technical round for TechNova Solutions (Full Stack MERN) is scheduled for Friday at 11:00 AM.',
        type: 'application',
        isRead: false,
      },
      {
        userId: primaryStudentUser._id,
        title: 'New Placement Drive',
        message: 'CloudScale Systems has published a new drive for Backend Systems Engineer (18 LPA).',
        type: 'drive',
        isRead: true,
      },
      {
        userId: primaryStudentUser._id,
        title: 'Profile Updated',
        message: 'Your student profile information is 85% complete.',
        type: 'system',
        isRead: true,
      },
    ]);

    console.log('\n===============================================================');
    console.log('✅ SEED DATA CREATED SUCCESSFULLY!');
    console.log('---------------------------------------------------------------');
    console.log('🔑 DEMO ACCOUNTS (Zero passwords - Email OTP / Dev OTP: 123456):');
    console.log('   👨‍💼 Admin (Placement Officer): admin@placement.local');
    console.log('   🏢 Recruiter (TechNova):      recruiter@placement.local');
    console.log('   🎓 Student (Aarav Sharma):     student@placement.local');
    console.log('---------------------------------------------------------------');
    console.log(`📊 Total Seeded:`);
    console.log(`   - 1 Admin, 1 Recruiter, 11 Students`);
    console.log(`   - 5 Partner Companies`);
    console.log(`   - 8 Placement Drives`);
    console.log(`   - 11 Applications (Applied, Shortlisted, Test, Interview, Selected, Rejected)`);
    console.log(`   - 3 College Announcements`);
    console.log('===============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
