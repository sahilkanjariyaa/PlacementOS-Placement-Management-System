import { Application } from '../models/Application.js';
import { Drive } from '../models/Drive.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { User } from '../models/User.js';
import { checkEligibility } from '../services/eligibilityService.js';
import { createNotification } from '../services/notificationService.js';

export const applyToDrive = async (req, res, next) => {
  try {
    const { driveId } = req.params;

    // 1. Fetch Student Profile
    const studentProfile = await StudentProfile.findOne({ userId: req.user.userId });
    if (!studentProfile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your student profile before applying for placement drives.',
      });
    }

    // 2. Fetch Placement Drive
    const drive = await Drive.findById(driveId).populate('companyId', 'name');
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found.' });
    }

    // 3. Server-side Eligibility Check (Backend Authoritative)
    const eligibility = checkEligibility(studentProfile, drive);
    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: 'You do not meet the eligibility criteria for this placement drive.',
        reasons: eligibility.reasons,
      });
    }

    // 4. Duplicate Check
    const existingApp = await Application.findOne({
      driveId: drive._id,
      studentId: studentProfile._id,
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'Application already submitted for this placement drive.',
      });
    }

    // 5. Create Application
    const application = await Application.create({
      driveId: drive._id,
      studentId: studentProfile._id,
      status: 'applied',
      appliedAt: new Date(),
    });

    // 6. Notify Student
    await createNotification({
      userId: req.user.userId,
      title: 'Application Submitted Successfully',
      message: `Your application for ${drive.title} at ${drive.companyId.name} has been received.`,
      type: 'application',
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      data: application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Application already submitted for this placement drive.',
      });
    }
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: req.user.userId });
    if (!studentProfile) {
      return res.status(200).json({ success: true, data: [] });
    }

    const applications = await Application.find({ studentId: studentProfile._id })
      .populate({
        path: 'driveId',
        populate: { path: 'companyId', select: 'name industry location website' },
      })
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const { driveId, status, department, search, page = 1, limit = 50 } = req.query;

    const query = {};
    if (driveId) query.driveId = driveId;
    if (status) query.status = status;

    let applications = await Application.find(query)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email phone isActive' },
      })
      .populate({
        path: 'driveId',
        populate: { path: 'companyId', select: 'name industry location' },
      })
      .sort({ appliedAt: -1 });

    // Recruiter scoping: filter to drives belonging to their company or created by them
    if (req.user.role === 'recruiter') {
      let recCompanyId = req.user.companyId;
      if (!recCompanyId) {
        const dbUser = await User.findById(req.user.userId);
        recCompanyId = dbUser?.companyId;
      }

      const recruiterDrives = await Drive.find({
        $or: [
          ...(recCompanyId ? [{ companyId: recCompanyId }] : []),
          { createdBy: req.user.userId },
        ],
      }).select('_id companyId');

      const recruiterDriveIdSet = new Set(recruiterDrives.map((d) => d._id.toString()));

      applications = applications.filter((app) => {
        if (!app.driveId) return false;
        const appDriveIdStr = (app.driveId._id || app.driveId).toString();
        const driveCompId = app.driveId.companyId?._id || app.driveId.companyId;
        const compMatches =
          recCompanyId && driveCompId && driveCompId.toString() === recCompanyId.toString();
        const driveMatches = recruiterDriveIdSet.has(appDriveIdStr);
        return compMatches || driveMatches;
      });
    }

    // Filter by department if requested
    if (department) {
      applications = applications.filter(
        (app) => app.studentId && app.studentId.department === department
      );
    }

    // Search filter (student name, email, roll no, company, drive title)
    if (search) {
      const regex = new RegExp(search, 'i');
      applications = applications.filter((app) => {
        const studentName = app.studentId?.userId?.name || '';
        const studentEmail = app.studentId?.userId?.email || '';
        const rollNo = app.studentId?.enrollmentNo || '';
        const companyName = app.driveId?.companyId?.name || '';
        const driveTitle = app.driveId?.title || '';
        return (
          regex.test(studentName) ||
          regex.test(studentEmail) ||
          regex.test(rollNo) ||
          regex.test(companyName) ||
          regex.test(driveTitle)
        );
      });
    }

    const total = applications.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = applications.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      data: {
        applications: paginated,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email phone isActive' },
      })
      .populate({
        path: 'driveId',
        populate: { path: 'companyId', select: 'name industry location hrName hrEmail' },
      });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const allowedStatuses = ['applied', 'shortlisted', 'test', 'interview', 'selected', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('studentId')
      .populate({ path: 'driveId', populate: { path: 'companyId', select: 'name' } });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Scoping for recruiter: allow if drive company matches or created by recruiter
    if (req.user.role === 'recruiter') {
      let recCompanyId = req.user.companyId;
      if (!recCompanyId) {
        const dbUser = await User.findById(req.user.userId);
        recCompanyId = dbUser?.companyId;
      }
      const driveCompId = application.driveId?.companyId?._id || application.driveId?.companyId;
      const isOwner = application.driveId?.createdBy?.toString() === req.user.userId.toString();
      const isCompanyMatch = recCompanyId && driveCompId && driveCompId.toString() === recCompanyId.toString();
      if (!isOwner && !isCompanyMatch) {
        return res.status(403).json({ success: false, message: 'Unauthorized to update this application.' });
      }
    }

    application.status = status;
    if (remarks !== undefined) application.remarks = remarks;
    if (['selected', 'rejected'].includes(status)) {
      application.resultDate = new Date();
    }

    await application.save();

    // If selected, update student profile placement status to 'placed'
    if (status === 'selected' && application.studentId) {
      await StudentProfile.findByIdAndUpdate(application.studentId._id, {
        placementStatus: 'placed',
      });
    }

    // Send notification to the student
    if (application.studentId?.userId) {
      const companyName = application.driveId?.companyId?.name || 'Company';
      const statusLabels = {
        shortlisted: `Congratulations! You have been Shortlisted for ${application.driveId?.title} at ${companyName}.`,
        test: `Assessment Round scheduled for ${application.driveId?.title} at ${companyName}. Check remarks for schedule.`,
        interview: `Interview Round invitation for ${application.driveId?.title} at ${companyName}.`,
        selected: `🎉 Congratulations! You have been Selected for ${application.driveId?.title} at ${companyName}!`,
        rejected: `Update regarding your application for ${application.driveId?.title} at ${companyName}.`,
      };

      if (statusLabels[status]) {
        await createNotification({
          userId: application.studentId.userId,
          title: `Application Status Updated: ${status.toUpperCase()}`,
          message: statusLabels[status] + (remarks ? ` Note: ${remarks}` : ''),
          type: 'application',
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}.`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};
