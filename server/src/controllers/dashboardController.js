import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Company } from '../models/Company.js';
import { Drive } from '../models/Drive.js';
import { Application } from '../models/Application.js';
import { Announcement } from '../models/Announcement.js';
import { checkEligibility } from '../services/eligibilityService.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const { role, userId, companyId } = req.user;

    if (role === 'student') {
      const studentProfile = await StudentProfile.findOne({ userId });
      const openDrives = await Drive.find({
        status: 'open',
        deadline: { $gte: new Date() },
      }).populate('companyId', 'name location logo');

      let eligibleDrivesCount = 0;
      if (studentProfile) {
        eligibleDrivesCount = openDrives.filter((d) => checkEligibility(studentProfile, d).eligible).length;
      }

      const applications = studentProfile
        ? await Application.find({ studentId: studentProfile._id }).populate({
            path: 'driveId',
            populate: { path: 'companyId', select: 'name location' },
          })
        : [];

      const totalApplied = applications.length;
      const shortlisted = applications.filter((a) => a.status === 'shortlisted').length;
      const tests = applications.filter((a) => a.status === 'test').length;
      const interviews = applications.filter((a) => a.status === 'interview').length;
      const selected = applications.filter((a) => a.status === 'selected').length;
      const rejected = applications.filter((a) => a.status === 'rejected').length;

      // Calculate profile completion score purely based on student-entered data
      let completionScore = 15; // 15% for verified registered account
      if (studentProfile) {
        if (studentProfile.enrollmentNo && studentProfile.enrollmentNo.trim()) completionScore += 15;
        if (studentProfile.department && studentProfile.department.trim()) completionScore += 15;
        if (studentProfile.semester) completionScore += 10;
        if (studentProfile.cgpa !== null && studentProfile.cgpa !== undefined && studentProfile.cgpa > 0) completionScore += 15;
        if (studentProfile.phone && studentProfile.phone.trim()) completionScore += 10;
        if (studentProfile.skills && studentProfile.skills.length > 0) completionScore += 10;
        if (studentProfile.resumeUrl && studentProfile.resumeUrl.trim()) completionScore += 10;
      }
      completionScore = Math.min(100, completionScore);

      const recentAnnouncements = await Announcement.find({
        isPublished: true,
        audience: { $in: ['all', 'student'] },
      })
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        data: {
          role: 'student',
          metrics: {
            eligibleDrives: eligibleDrivesCount,
            totalApplied,
            shortlisted,
            tests,
            interviews,
            selected,
            rejected,
            placementStatus: studentProfile?.placementStatus || 'unplaced',
            profileCompletion: completionScore,
          },
          recentApplications: applications.slice(0, 5),
          upcomingDrives: openDrives.slice(0, 5),
          announcements: recentAnnouncements,
        },
      });
    }

    if (role === 'admin') {
      const [
        totalStudents,
        totalCompanies,
        activeDrives,
        totalApplications,
        shortlistedApps,
        testApps,
        interviewApps,
        selectedApps,
        placedStudents,
        recentApplications,
        recentDrives,
      ] = await Promise.all([
        StudentProfile.countDocuments(),
        Company.countDocuments({ isActive: true }),
        Drive.countDocuments({ status: 'open' }),
        Application.countDocuments(),
        Application.countDocuments({ status: 'shortlisted' }),
        Application.countDocuments({ status: 'test' }),
        Application.countDocuments({ status: 'interview' }),
        Application.countDocuments({ status: 'selected' }),
        StudentProfile.countDocuments({ placementStatus: 'placed' }),
        Application.find()
          .populate({
            path: 'studentId',
            populate: { path: 'userId', select: 'name email' },
          })
          .populate({
            path: 'driveId',
            populate: { path: 'companyId', select: 'name' },
          })
          .sort({ appliedAt: -1 })
          .limit(6),
        Drive.find().populate('companyId', 'name industry').sort({ createdAt: -1 }).limit(5),
      ]);

      const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0;

      return res.status(200).json({
        success: true,
        data: {
          role: 'admin',
          metrics: {
            totalStudents,
            totalCompanies,
            activeDrives,
            totalApplications,
            shortlisted: shortlistedApps,
            tests: testApps,
            interviews: interviewApps,
            selected: selectedApps,
            placedStudents,
            placementRate: Number(placementRate),
          },
          recentApplications,
          recentDrives,
        },
      });
    }

    if (role === 'recruiter') {
      let recCompanyId = companyId;
      if (!recCompanyId) {
        const dbUser = await User.findById(userId);
        recCompanyId = dbUser?.companyId;
      }
      const companyDrives = recCompanyId ? await Drive.find({ companyId: recCompanyId }) : [];
      const driveIds = companyDrives.map((d) => d._id);

      const [totalApps, shortlisted, interviews, selected] = await Promise.all([
        Application.countDocuments({ driveId: { $in: driveIds } }),
        Application.countDocuments({ driveId: { $in: driveIds }, status: 'shortlisted' }),
        Application.countDocuments({ driveId: { $in: driveIds }, status: 'interview' }),
        Application.countDocuments({ driveId: { $in: driveIds }, status: 'selected' }),
      ]);

      const recentApplications = await Application.find({ driveId: { $in: driveIds } })
        .populate({
          path: 'studentId',
          populate: { path: 'userId', select: 'name email' },
        })
        .populate('driveId', 'title location package')
        .sort({ appliedAt: -1 })
        .limit(6);

      return res.status(200).json({
        success: true,
        data: {
          role: 'recruiter',
          metrics: {
            activeDrives: companyDrives.filter((d) => d.status === 'open').length,
            totalDrives: companyDrives.length,
            totalApplicants: totalApps,
            shortlisted,
            interviews,
            selected,
          },
          drives: companyDrives,
          recentApplications,
        },
      });
    }

    res.status(400).json({ success: false, message: 'Invalid role for dashboard stats.' });
  } catch (error) {
    next(error);
  }
};
