import { Drive } from '../models/Drive.js';
import { Company } from '../models/Company.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Application } from '../models/Application.js';
import { checkEligibility } from '../services/eligibilityService.js';
import { broadcastNotification } from '../services/notificationService.js';
import { User } from '../models/User.js';

export const getDrives = async (req, res, next) => {
  try {
    const { search, department, minPackage, status, location, jobType } = req.query;

    // Automatically sync and close open drives whose deadline has passed
    await Drive.updateMany(
      { status: 'open', deadline: { $lt: new Date() } },
      { status: 'closed' }
    );

    const query = {};
    if (status) {
      query.status = status;
    }

    // For students: ONLY show active, non-expired drives where deadline has not passed
    if (req.user && req.user.role === 'student') {
      query.status = 'open';
      query.deadline = { $gte: new Date() };
    }

    if (location) query.location = new RegExp(location, 'i');
    if (jobType) query.jobType = jobType;
    if (minPackage) query.package = { $gte: Number(minPackage) };
    if (department) query.eligibleDepartments = department;

    let drives = await Drive.find(query)
      .populate('companyId', 'name industry website location logo')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    if (search) {
      const regex = new RegExp(search, 'i');
      drives = drives.filter((d) => {
        const titleMatch = regex.test(d.title);
        const compMatch = d.companyId && regex.test(d.companyId.name);
        const locMatch = regex.test(d.location);
        return titleMatch || compMatch || locMatch;
      });
    }

    // If student, compute eligibility and applied status for each drive
    if (req.user && req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ userId: req.user.userId });
      const studentApplications = await Application.find({ studentId: studentProfile?._id });
      const appliedDriveIds = new Set(studentApplications.map((a) => a.driveId.toString()));

      const enrichedDrives = drives.map((drive) => {
        const driveObj = drive.toObject();
        const eligibility = checkEligibility(studentProfile, drive);
        driveObj.isEligible = eligibility.eligible;
        driveObj.eligibilityReasons = eligibility.reasons;
        driveObj.hasApplied = appliedDriveIds.has(drive._id.toString());
        return driveObj;
      });

      return res.status(200).json({ success: true, data: enrichedDrives });
    }

    // If recruiter, filter drives by their company or createdBy
    if (req.user && req.user.role === 'recruiter') {
      let recCompanyId = req.user.companyId;
      if (!recCompanyId) {
        const dbUser = await User.findById(req.user.userId);
        recCompanyId = dbUser?.companyId;
      }
      drives = drives.filter((d) => {
        const compMatches =
          recCompanyId &&
          d.companyId &&
          (d.companyId._id || d.companyId).toString() === recCompanyId.toString();
        const userMatches =
          d.createdBy &&
          (d.createdBy._id || d.createdBy).toString() === req.user.userId.toString();
        return compMatches || userMatches;
      });
    }

    // Attach applicantCount for recruiter and admin views
    if (req.user && (req.user.role === 'recruiter' || req.user.role === 'admin')) {
      const driveIds = drives.map((d) => d._id);
      const appCounts = await Application.aggregate([
        { $match: { driveId: { $in: driveIds } } },
        { $group: { _id: '$driveId', count: { $sum: 1 } } },
      ]);
      const countMap = {};
      appCounts.forEach((item) => {
        countMap[item._id.toString()] = item.count;
      });

      const enrichedDrives = drives.map((drive) => {
        const driveObj = drive.toObject ? drive.toObject() : drive;
        driveObj.applicantCount = countMap[drive._id.toString()] || 0;
        return driveObj;
      });

      return res.status(200).json({
        success: true,
        data: enrichedDrives,
      });
    }

    res.status(200).json({
      success: true,
      data: drives,
    });
  } catch (error) {
    next(error);
  }
};

export const getEligibleDrives = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: req.user.userId });
    if (!studentProfile) {
      return res.status(200).json({ success: true, data: [] });
    }

    const openDrives = await Drive.find({ status: 'open', deadline: { $gte: new Date() } })
      .populate('companyId', 'name industry website location')
      .sort({ deadline: 1 });

    const studentApplications = await Application.find({ studentId: studentProfile._id });
    const appliedDriveIds = new Set(studentApplications.map((a) => a.driveId.toString()));

    const eligibleDrives = openDrives
      .filter((drive) => {
        const eligibility = checkEligibility(studentProfile, drive);
        return eligibility.eligible;
      })
      .map((drive) => {
        const driveObj = drive.toObject();
        driveObj.isEligible = true;
        driveObj.hasApplied = appliedDriveIds.has(drive._id.toString());
        return driveObj;
      });

    res.status(200).json({
      success: true,
      data: eligibleDrives,
    });
  } catch (error) {
    next(error);
  }
};

export const getDriveById = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id)
      .populate('companyId', 'name industry website location hrName hrEmail')
      .populate('createdBy', 'name email role');

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found.' });
    }

    const driveObj = drive.toObject();

    if (req.user && req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ userId: req.user.userId });
      const eligibility = checkEligibility(studentProfile, drive);
      const application = await Application.findOne({
        driveId: drive._id,
        studentId: studentProfile?._id,
      });

      driveObj.isEligible = eligibility.eligible;
      driveObj.eligibilityReasons = eligibility.reasons;
      driveObj.application = application || null;
      driveObj.hasApplied = !!application;
    }

    res.status(200).json({
      success: true,
      data: driveObj,
    });
  } catch (error) {
    next(error);
  }
};

export const createDrive = async (req, res, next) => {
  try {
    const {
      companyId: bodyCompanyId,
      title,
      description,
      package: pkg,
      location,
      jobType,
      deadline,
      minCgpa,
      eligibleDepartments,
      maxBacklogs,
      eligibleSemesters,
    } = req.body;

    let companyId = bodyCompanyId;

    // For recruiter: auto-resolve or link recruiter company
    if (req.user.role === 'recruiter') {
      if (!companyId && req.user.companyId) {
        companyId = req.user.companyId;
      }
      if (!companyId) {
        const dbUser = await User.findById(req.user.userId);
        if (dbUser && dbUser.companyId) {
          companyId = dbUser.companyId;
        }
      }
      if (!companyId) {
        let company = await Company.findOne({ hrEmail: req.user.email });
        if (!company) {
          company = await Company.create({
            name: `${req.user.name}'s Organization`,
            industry: 'Technology & Services',
            location: location ? location.trim() : 'Bengaluru, India',
            website: `https://${req.user.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.example.com`,
            hrName: req.user.name,
            hrEmail: req.user.email,
            isActive: true,
          });
        }
        await User.findByIdAndUpdate(req.user.userId, { companyId: company._id });
        req.user.companyId = company._id;
        companyId = company._id;
      }
    }

    if (!companyId || !title || !description || pkg === undefined || !location || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Company, Title, Description, CTC Package, Location, and Deadline are required.',
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Selected company does not exist.' });
    }

    // Enforce recruiter ownership if assigned
    if (req.user.role === 'recruiter' && req.user.companyId && req.user.companyId.toString() !== companyId.toString()) {
      return res.status(403).json({ success: false, message: 'You can only create drives for your assigned company.' });
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid deadline date.' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (deadlineDate < todayStart) {
      return res.status(400).json({
        success: false,
        message: 'Placement drive deadline cannot be a past date. Please select today or a future date.',
      });
    }

    const drive = await Drive.create({
      companyId,
      title: title.trim(),
      description,
      package: Number(pkg),
      location: location.trim(),
      jobType: jobType || 'full_time',
      deadline: deadlineDate,
      minCgpa: minCgpa !== undefined ? Number(minCgpa) : 6.0,
      eligibleDepartments: eligibleDepartments || ['Computer Science', 'Information Technology'],
      maxBacklogs: maxBacklogs !== undefined ? Number(maxBacklogs) : 0,
      eligibleSemesters: eligibleSemesters || [7, 8],
      status: 'open',
      createdBy: req.user.userId,
    });

    // Notify all active students
    const students = await User.find({ role: 'student', isActive: true }).select('_id');
    const studentUserIds = students.map((s) => s._id);
    await broadcastNotification(studentUserIds, {
      title: `New Placement Drive: ${company.name}`,
      message: `${company.name} is hiring for ${title} (${pkg} LPA). Check your eligibility and apply before the deadline!`,
      type: 'drive',
    });

    res.status(201).json({
      success: true,
      message: 'Placement drive created and published successfully.',
      data: drive,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDrive = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found.' });
    }

    if (req.user.role === 'recruiter' && req.user.companyId && req.user.companyId.toString() !== drive.companyId.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot edit drives from other companies.' });
    }

    // Validate deadline if provided in update
    if (req.body.deadline !== undefined) {
      const deadlineDate = new Date(req.body.deadline);
      if (isNaN(deadlineDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Please provide a valid deadline date.' });
      }
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Only reject if updating to a past date and not explicitly setting status to closed/completed
      if (deadlineDate < todayStart && req.body.status !== 'closed' && req.body.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Placement drive deadline cannot be a past date. Please select today or a future date.',
        });
      }
      drive.deadline = deadlineDate;
      // Auto-reopen if extended to future and previously auto-closed
      if (deadlineDate >= new Date() && req.body.status === undefined && drive.status === 'closed') {
        drive.status = 'open';
      }
    }

    const fields = [
      'title',
      'description',
      'package',
      'location',
      'jobType',
      'minCgpa',
      'eligibleDepartments',
      'maxBacklogs',
      'eligibleSemesters',
      'status',
      'companyId',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (['package', 'minCgpa', 'maxBacklogs'].includes(field)) {
          drive[field] = Number(req.body[field]);
        } else {
          drive[field] = req.body[field];
        }
      }
    });

    await drive.save();

    res.status(200).json({
      success: true,
      message: 'Placement drive updated successfully.',
      data: drive,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDrive = async (req, res, next) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found.' });
    }

    drive.status = 'closed';
    await drive.save();

    res.status(200).json({
      success: true,
      message: 'Placement drive closed.',
    });
  } catch (error) {
    next(error);
  }
};
