import http from 'http';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { lastDispatchedOtps } from './src/services/emailService.js';
import { OTPVerification } from './src/models/OTPVerification.js';
import { Drive } from './src/models/Drive.js';
import mongoose from 'mongoose';

let server;
const PORT = 5999;
const BASE_URL = `http://localhost:${PORT}/api`;

const makeRequest = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : {};
            resolve({ status: res.statusCode, body: parsed, raw: rawData });
          } catch (e) {
            resolve({ status: res.statusCode, body: rawData, raw: rawData });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runAllTests = async () => {
  console.log('\n===============================================================');
  console.log('🧪 RUNNING COMPREHENSIVE AUTOMATED INTEGRATION TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extraInfo = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} - ${extraInfo}`);
      failed++;
    }
  };

  try {
    await connectDB();
    server = app.listen(PORT);
    console.log(`[Test Server] Running on port ${PORT}\n`);

    // -------------------------------------------------------------
    // TEST SUITE 1: AUTHENTICATION (Gmail OTP + JWT)
    // -------------------------------------------------------------
    console.log('--- TEST SUITE 1: AUTHENTICATION (REAL-TIME GMAIL OTP + JWT) ---');

    // 1.1 Request Signup OTP for new user
    const uniqueEmail = `test.student.${Date.now()}@placement.local`;
    const signupOtpRes = await makeRequest('POST', '/auth/request-signup-otp', {
      name: 'Test Student',
      email: uniqueEmail,
    });
    assert(signupOtpRes.status === 200 && signupOtpRes.body.success, 'AUTH-01: Request Signup OTP for new email');
    const realStudentOtp = lastDispatchedOtps.get(uniqueEmail.toLowerCase().trim());

    // 1.2 Invalid Signup OTP
    const invalidOtpRes = await makeRequest('POST', '/auth/verify-signup-otp', {
      name: 'Test Student',
      email: uniqueEmail,
      otp: '000000',
    });
    assert(invalidOtpRes.status === 400, 'AUTH-02: Reject invalid OTP');

    // 1.3 Verify Signup OTP with Real Dispatched OTP
    const validSignupRes = await makeRequest('POST', '/auth/verify-signup-otp', {
      name: 'Test Student',
      email: uniqueEmail,
      otp: realStudentOtp,
    });
    assert(
      validSignupRes.status === 201 && validSignupRes.body.data.token && validSignupRes.body.data.user.role === 'student',
      'AUTH-03: Verify Real-Time Signup OTP creates user, profile, and issues JWT'
    );
    const newStudentToken = validSignupRes.body.data.token;

    // 1.3b Second Student Signup (verifies zero duplicate enrollment collision for unpopulated profiles)
    const secondStudentEmail = `test.student2.${Date.now()}@placement.local`;
    await makeRequest('POST', '/auth/request-signup-otp', {
      name: 'Second Student',
      email: secondStudentEmail,
    });
    const secondStudentOtp = lastDispatchedOtps.get(secondStudentEmail.toLowerCase().trim());
    const secondSignupRes = await makeRequest('POST', '/auth/verify-signup-otp', {
      name: 'Second Student',
      email: secondStudentEmail,
      otp: secondStudentOtp,
    });
    assert(
      secondSignupRes.status === 201 && secondSignupRes.body.data.token,
      'AUTH-03b: Multiple student signups without enrollment number collision'
    );

    // 1.3b Recruiter Signup & Onboarding with Real OTP
    const recruiterSignupEmail = `recruiter.${Date.now()}@corporate.com`;
    await makeRequest('POST', '/auth/request-signup-otp', {
      name: 'Corporate HR',
      email: recruiterSignupEmail,
    });
    const realRecruiterOtp = lastDispatchedOtps.get(recruiterSignupEmail.toLowerCase().trim());

    const recruiterSignupRes = await makeRequest('POST', '/auth/verify-signup-otp', {
      name: 'Corporate HR',
      email: recruiterSignupEmail,
      otp: realRecruiterOtp,
      role: 'recruiter',
      companyName: 'Global Cloud Systems',
      industry: 'Cloud Infrastructure',
      location: 'Bengaluru',
    });
    assert(
      recruiterSignupRes.status === 201 &&
        recruiterSignupRes.body.data.user.role === 'recruiter' &&
        recruiterSignupRes.body.data.token,
      'AUTH-03b: Recruiter Signup & Company Onboarding with Real-Time OTP'
    );

    // 1.4 Duplicate Signup should be rejected
    const dupSignupRes = await makeRequest('POST', '/auth/request-signup-otp', {
      name: 'Duplicate Student',
      email: uniqueEmail,
    });
    assert(dupSignupRes.status === 400, 'AUTH-04: Prevent duplicate signup for existing email');

    // 1.4b Existing Student email cannot sign up as Recruiter
    const crossSignupRes = await makeRequest('POST', '/auth/request-signup-otp', {
      name: 'Imposter Recruiter',
      email: uniqueEmail,
      role: 'recruiter',
    });
    assert(crossSignupRes.status === 400, 'AUTH-04b: Prevent student email from registering as Recruiter');

    // 1.4c Existing Recruiter email cannot sign up as Student
    const crossStudentSignupRes = await makeRequest('POST', '/auth/request-signup-otp', {
      name: 'Imposter Student',
      email: recruiterSignupEmail,
      role: 'student',
    });
    assert(crossStudentSignupRes.status === 400, 'AUTH-04c: Prevent recruiter email from registering as Student');

    // 1.5 Login OTP for existing seeded student
    const studentEmail = 'student@placement.local';
    const loginOtpRes = await makeRequest('POST', '/auth/request-login-otp', {
      email: studentEmail,
      expectedRole: 'student',
    });
    assert(loginOtpRes.status === 200, 'AUTH-05: Request Login OTP for student with expectedRole student');
    const realStudentLoginOtp = lastDispatchedOtps.get(studentEmail.toLowerCase().trim());

    // 1.5b Prevent cross-role login: Student email attempting admin login
    const crossRoleRes = await makeRequest('POST', '/auth/request-login-otp', {
      email: studentEmail,
      expectedRole: 'admin',
    });
    assert(crossRoleRes.status === 400, 'AUTH-05b: Block student email attempting login via Admin portal');

    // 1.5c Prevent cross-role login: Admin email attempting student login
    const crossRoleAdminRes = await makeRequest('POST', '/auth/request-login-otp', {
      email: 'admin@placement.local',
      expectedRole: 'student',
    });
    assert(crossRoleAdminRes.status === 400, 'AUTH-05c: Block admin email attempting login via Student portal');

    // 1.6 Verify Login OTP
    const verifyLoginRes = await makeRequest('POST', '/auth/verify-login-otp', {
      email: studentEmail,
      otp: realStudentLoginOtp,
    });
    assert(
      verifyLoginRes.status === 200 && verifyLoginRes.body.data.token,
      'AUTH-06: Verify Real-Time Login OTP and issue student JWT'
    );
    const studentToken = verifyLoginRes.body.data.token;

    // 1.7 Login OTP for Admin
    await OTPVerification.deleteMany({ email: 'admin@placement.local' });
    await makeRequest('POST', '/auth/request-login-otp', {
      email: 'admin@placement.local',
      expectedRole: 'admin',
    });
    const realAdminLoginOtp = lastDispatchedOtps.get('admin@placement.local');
    const adminVerify = await makeRequest('POST', '/auth/verify-login-otp', {
      email: 'admin@placement.local',
      otp: realAdminLoginOtp,
    });
    assert(adminVerify.status === 200 && adminVerify.body.data.user.role === 'admin', 'AUTH-07: Admin Real-Time OTP Login');
    const adminToken = adminVerify.body.data.token;

    // 1.8 Login OTP for Recruiter
    await OTPVerification.deleteMany({ email: 'recruiter@placement.local' });
    await makeRequest('POST', '/auth/request-login-otp', {
      email: 'recruiter@placement.local',
      expectedRole: 'recruiter',
    });
    const realRecruiterLoginOtp = lastDispatchedOtps.get('recruiter@placement.local');
    const recVerify = await makeRequest('POST', '/auth/verify-login-otp', {
      email: 'recruiter@placement.local',
      otp: realRecruiterLoginOtp,
    });
    assert(recVerify.status === 200 && recVerify.body.data.user.role === 'recruiter', 'AUTH-08: Recruiter Real-Time OTP Login');
    const recruiterToken = recVerify.body.data.token;

    // 1.9 GET /api/auth/me
    const meRes = await makeRequest('GET', '/auth/me', null, studentToken);
    assert(meRes.status === 200 && meRes.body.data.user.email === studentEmail, 'AUTH-09: GET /api/auth/me returns identity');

    // 1.10 Unauthenticated request blocked
    const unauthRes = await makeRequest('GET', '/auth/me');
    assert(unauthRes.status === 401, 'AUTH-10: Block request with missing JWT');

    // -------------------------------------------------------------
    // TEST SUITE 2: ROLE-BASED ACCESS CONTROL (RBAC)
    // -------------------------------------------------------------
    console.log('\n--- TEST SUITE 2: ROLE-BASED ACCESS CONTROL (RBAC) ---');

    // 2.1 Student attempting Admin action (create company)
    const studentBlockedRes = await makeRequest(
      'POST',
      '/companies',
      {
        name: 'Unauthorized Corp',
        industry: 'Software',
        website: 'https://test.com',
        location: 'Delhi',
        hrName: 'Test',
        hrEmail: 'test@corp.com',
      },
      studentToken
    );
    assert(studentBlockedRes.status === 403, 'RBAC-01: Student blocked from Admin company creation (403 Forbidden)');

    // 2.2 Admin creating company
    const adminCreateCompanyRes = await makeRequest(
      'POST',
      '/companies',
      {
        name: `InnoTech Solutions ${Date.now()}`,
        industry: 'Enterprise Software',
        website: 'https://innotech.example.com',
        location: 'Bengaluru',
        hrName: 'Karan Mehra',
        hrEmail: 'karan@innotech.example.com',
      },
      adminToken
    );
    assert(adminCreateCompanyRes.status === 201, 'RBAC-02: Admin authorized to create company');
    const createdCompanyId = adminCreateCompanyRes.body.data._id;

    // -------------------------------------------------------------
    // TEST SUITE 3: PLACEMENT DRIVES & ELIGIBILITY ENGINE
    // -------------------------------------------------------------
    console.log('\n--- TEST SUITE 3: PLACEMENT DRIVES & ELIGIBILITY ENGINE ---');

    // 3.1 Admin creates high-threshold drive (Min CGPA: 9.0)
    const highCgpaDriveRes = await makeRequest(
      'POST',
      '/drives',
      {
        companyId: createdCompanyId,
        title: 'Principal Systems Architect',
        description: 'Elite technical architect role for high CGPA achievers.',
        package: 28.0,
        location: 'Bengaluru',
        jobType: 'full_time',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        minCgpa: 9.0, // Student Aarav has CGPA 8.75
        eligibleDepartments: ['Computer Science'],
        maxBacklogs: 0,
      },
      adminToken
    );
    assert(highCgpaDriveRes.status === 201, 'DRIVE-01: Admin creates placement drive');
    const highDriveId = highCgpaDriveRes.body.data._id;

    // 3.1b Admin attempt to create drive with past deadline is rejected
    const pastDeadlineRes = await makeRequest(
      'POST',
      '/drives',
      {
        companyId: createdCompanyId,
        title: 'Past Date Role',
        description: 'Should be rejected.',
        package: 10.0,
        location: 'Bengaluru',
        jobType: 'full_time',
        deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        minCgpa: 6.0,
        eligibleDepartments: ['Computer Science'],
        maxBacklogs: 2,
      },
      adminToken
    );
    assert(
      pastDeadlineRes.status === 400,
      'DRIVE-01b: Drive creation rejects past deadline with 400 Bad Request'
    );

    // 3.1c Recruiter publishes campus drive with proper information
    const recruiterDriveRes = await makeRequest(
      'POST',
      '/drives',
      {
        title: 'Senior Frontend Engineer',
        description: 'Lead modern UI development using React and Tailwind.',
        package: 18.0,
        location: 'Bengaluru / Hybrid',
        jobType: 'full_time',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        minCgpa: 7.0,
        eligibleDepartments: ['Computer Science', 'Information Technology'],
        maxBacklogs: 0,
      },
      recruiterToken
    );
    assert(
      recruiterDriveRes.status === 201 && recruiterDriveRes.body.data.title === 'Senior Frontend Engineer',
      'DRIVE-01c: Recruiter publishes campus drive with proper information'
    );

    // 3.1d Simulate an expired drive in DB (created validly in past, deadline now passed)
    const expiredDoc = await Drive.create({
      companyId: createdCompanyId,
      createdBy: adminVerify.body.data.user._id,
      title: 'Expired Legacy Role',
      description: 'Past deadline drive.',
      package: 10.0,
      location: 'Bengaluru',
      jobType: 'full_time',
      deadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      minCgpa: 6.0,
      eligibleDepartments: ['Computer Science'],
      maxBacklogs: 2,
      status: 'open',
    });
    const expiredDriveId = expiredDoc._id;

    // 3.1d Student drives listing excludes expired drive and auto-syncs status to closed
    const studentDrivesListRes = await makeRequest('GET', '/drives', null, studentToken);
    const studentDriveIds = studentDrivesListRes.body.data.map((d) => d._id.toString());
    assert(
      !studentDriveIds.includes(expiredDriveId.toString()),
      'DRIVE-02: Student drives listing excludes expired drives whose deadline has ended'
    );

    const updatedExpiredDoc = await Drive.findById(expiredDriveId);
    assert(
      updatedExpiredDoc.status === 'closed',
      'DRIVE-02b: Drive auto-syncs status to closed when deadline has passed'
    );

    // 3.2 Student checks drive details (Backend computed eligibility)
    const driveDetailRes = await makeRequest('GET', `/drives/${highDriveId}`, null, studentToken);
    assert(
      driveDetailRes.status === 200 && driveDetailRes.body.data.isEligible === false,
      'ELIG-01: Backend identifies student as ineligible when CGPA is below threshold'
    );

    // 3.3 Ineligible student application attempt rejected by backend
    const applyIneligibleRes = await makeRequest('POST', `/applications/${highDriveId}`, {}, studentToken);
    assert(
      applyIneligibleRes.status === 400 && applyIneligibleRes.body.reasons.length > 0,
      'ELIG-02: Authoritative backend blocks ineligible student application (400 Bad Request)'
    );

    // 3.4 Admin creates accessible drive (Min CGPA: 7.0)
    const eligibleDriveRes = await makeRequest(
      'POST',
      '/drives',
      {
        companyId: createdCompanyId,
        title: 'Associate Cloud Engineer',
        description: 'Design cloud native services.',
        package: 13.0,
        location: 'Hyderabad',
        jobType: 'full_time',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        minCgpa: 7.0, // Aarav (8.75) is eligible
        eligibleDepartments: ['Computer Science', 'Information Technology'],
        maxBacklogs: 0,
      },
      adminToken
    );
    const eligibleDriveId = eligibleDriveRes.body.data._id;

    // 3.5 Student checks eligible drives list
    const myEligibleDrives = await makeRequest('GET', '/drives/eligible', null, studentToken);
    assert(
      myEligibleDrives.status === 200 && myEligibleDrives.body.data.some((d) => d._id === eligibleDriveId),
      'ELIG-03: GET /api/drives/eligible includes accessible drive'
    );

    // -------------------------------------------------------------
    // TEST SUITE 4: APPLICATION LIFECYCLE & DUPLICATE PREVENTION
    // -------------------------------------------------------------
    console.log('\n--- TEST SUITE 4: APPLICATION LIFECYCLE & DUPLICATE PREVENTION ---');

    // 4.1 Eligible student submits application
    const submitAppRes = await makeRequest('POST', `/applications/${eligibleDriveId}`, {}, studentToken);
    assert(
      submitAppRes.status === 201 && submitAppRes.body.data.status === 'applied',
      'APP-01: Eligible student submits 1-click application'
    );
    const applicationId = submitAppRes.body.data._id;

    // 4.2 Duplicate application prevention
    const duplicateAppRes = await makeRequest('POST', `/applications/${eligibleDriveId}`, {}, studentToken);
    assert(
      duplicateAppRes.status === 400 && duplicateAppRes.body.message.includes('already submitted'),
      'APP-02: Compound index & validation blocks duplicate application'
    );

    // 4.3 Student views personal applications
    const myAppsRes = await makeRequest('GET', '/applications/my', null, studentToken);
    assert(
      myAppsRes.status === 200 && myAppsRes.body.data.some((a) => a._id === applicationId),
      'APP-03: Student views personal application pipeline'
    );

    // 4.4 Admin moves application stage to shortlisted
    const shortlistRes = await makeRequest(
      'PUT',
      `/applications/${applicationId}/status`,
      { status: 'shortlisted', remarks: 'Strong portfolio projects.' },
      adminToken
    );
    assert(shortlistRes.status === 200 && shortlistRes.body.data.status === 'shortlisted', 'APP-04: Admin shortlists candidate');

    // 4.5 Admin moves stage to selected
    const selectRes = await makeRequest(
      'PUT',
      `/applications/${applicationId}/status`,
      { status: 'selected', remarks: 'Selected for 13 LPA offer!' },
      adminToken
    );
    assert(selectRes.status === 200 && selectRes.body.data.status === 'selected', 'APP-05: Admin selects candidate');

    // 4.6 Verify student placement status auto-updates to 'placed'
    const studentProfileRes = await makeRequest('GET', '/students/profile', null, studentToken);
    assert(
      studentProfileRes.status === 200 && studentProfileRes.body.data.placementStatus === 'placed',
      'APP-06: Student profile placementStatus auto-updates to placed upon selection'
    );

    // 4.7 Student applies to Recruiter's newly published drive
    const studentRecDriveApp = await makeRequest(
      'POST',
      `/applications/${recruiterDriveRes.body.data._id}`,
      {},
      studentToken
    );
    assert(
      studentRecDriveApp.status === 201,
      'APP-07: Student applies to Recruiter published drive'
    );
    const recAppId = studentRecDriveApp.body.data._id;

    // 4.8 Recruiter queries applications and views candidate academic dossier
    const recAppsRes = await makeRequest(
      'GET',
      `/applications?driveId=${recruiterDriveRes.body.data._id}`,
      null,
      recruiterToken
    );
    assert(
      recAppsRes.status === 200 &&
        recAppsRes.body.data.applications.some(
          (a) =>
            a._id === recAppId &&
            a.studentId?.cgpa !== undefined &&
            a.studentId?.userId?.name === 'Aarav Sharma'
        ),
      'APP-08: Recruiter reviews applicants list with student academic profile dossier'
    );

    // 4.9 Recruiter updates candidate stage to interview and provides remarks
    const recUpdateRes = await makeRequest(
      'PUT',
      `/applications/${recAppId}/status`,
      { status: 'interview', remarks: 'Technical round scheduled on Friday.' },
      recruiterToken
    );
    assert(
      recUpdateRes.status === 200 && recUpdateRes.body.data.status === 'interview',
      'APP-09: Recruiter updates applicant status to interview with remarks'
    );

    // -------------------------------------------------------------
    // TEST SUITE 5: DASHBOARDS, REPORTS & CSV EXPORT
    // -------------------------------------------------------------
    console.log('\n--- TEST SUITE 5: DASHBOARDS, REPORTS & NOTIFICATIONS ---');

    // 5.1 Student Dashboard Stats
    const studentDashRes = await makeRequest('GET', '/dashboard/stats', null, studentToken);
    assert(
      studentDashRes.status === 200 && studentDashRes.body.data.role === 'student',
      'DASH-01: Dynamic Student dashboard stats returned'
    );

    // 5.2 Admin Dashboard Stats
    const adminDashRes = await makeRequest('GET', '/dashboard/stats', null, adminToken);
    assert(
      adminDashRes.status === 200 && adminDashRes.body.data.metrics.totalStudents > 0,
      'DASH-02: Dynamic Admin dashboard counters returned'
    );

    // 5.3 Admin Analytics Charts Data
    const analyticsRes = await makeRequest('GET', '/reports/analytics', null, adminToken);
    assert(
      analyticsRes.status === 200 &&
        analyticsRes.body.data.departmentPlacements &&
        analyticsRes.body.data.applicationsByStatus,
      'REPORT-01: Admin analytics data aggregated for Recharts'
    );

    // 5.4 CSV Export
    const csvExportRes = await makeRequest('GET', '/reports/export', null, adminToken);
    assert(
      csvExportRes.status === 200 && typeof csvExportRes.raw === 'string' && csvExportRes.raw.includes('Student Name'),
      'REPORT-02: Admin downloads placement CSV report'
    );

    // 5.5 Notifications
    const notifRes = await makeRequest('GET', '/notifications', null, studentToken);
    assert(
      notifRes.status === 200 && Array.isArray(notifRes.body.data.notifications),
      'NOTIF-01: Student receives notifications for drive and stage updates'
    );

    console.log('\n===============================================================');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================\n');

    server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal Test Suite Error:', err);
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(1);
  }
};

runAllTests();
