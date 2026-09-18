import { StudentProfile } from '../models/StudentProfile.js';
import { User } from '../models/User.js';

export const getProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user.userId }).populate('userId', 'name email role isActive');
    
    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user.userId,
        enrollmentNo: '',
        department: '',
        semester: null,
        cgpa: null,
        backlogs: 0,
        phone: '',
        skills: [],
        resumeUrl: '',
        placementStatus: 'unplaced',
      });
      profile = await profile.populate('userId', 'name email role isActive');
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const {
      department,
      semester,
      cgpa,
      backlogs,
      phone,
      skills,
      resumeUrl,
      enrollmentNo,
    } = req.body;

    // Validate CGPA
    if (cgpa !== undefined && (cgpa < 0 || cgpa > 10)) {
      return res.status(400).json({ success: false, message: 'CGPA must be between 0.0 and 10.0' });
    }

    // Validate backlogs
    if (backlogs !== undefined && backlogs < 0) {
      return res.status(400).json({ success: false, message: 'Backlogs cannot be negative' });
    }

    // Validate phone
    if (phone && !/^[0-9]{10}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
    }

    let profile = await StudentProfile.findOne({ userId: req.user.userId });
    if (!profile) {
      profile = new StudentProfile({ userId: req.user.userId });
    }

    if (department) profile.department = department;
    if (semester !== undefined) profile.semester = Number(semester);
    if (cgpa !== undefined) profile.cgpa = Number(cgpa);
    if (backlogs !== undefined) profile.backlogs = Number(backlogs);
    if (phone) profile.phone = phone.trim();
    if (skills) {
      profile.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl.trim();
    if (enrollmentNo && enrollmentNo.trim()) {
      const normalizedEnrollment = enrollmentNo.trim().toUpperCase();
      const duplicate = await StudentProfile.findOne({
        enrollmentNo: normalizedEnrollment,
        _id: { $ne: profile._id },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Enrollment number "${normalizedEnrollment}" is already assigned to another student.`,
        });
      }
      profile.enrollmentNo = normalizedEnrollment;
    }

    await profile.save();
    profile = await profile.populate('userId', 'name email role isActive');

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully.',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllStudents = async (req, res, next) => {
  try {
    const { search, department, placementStatus, minCgpa, page = 1, limit = 50 } = req.query;

    const query = {};
    if (department) query.department = department;
    if (placementStatus) query.placementStatus = placementStatus;
    if (minCgpa) query.cgpa = { $gte: Number(minCgpa) };

    let studentProfiles = await StudentProfile.find(query)
      .populate('userId', 'name email isActive')
      .sort({ createdAt: -1 });

    // Handle search filter on student name or email or enrollmentNo
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      studentProfiles = studentProfiles.filter((sp) => {
        const nameMatch = sp.userId && searchRegex.test(sp.userId.name);
        const emailMatch = sp.userId && searchRegex.test(sp.userId.email);
        const rollMatch = searchRegex.test(sp.enrollmentNo);
        return nameMatch || emailMatch || rollMatch;
      });
    }

    const total = studentProfiles.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = studentProfiles.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      data: {
        students: paginated,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findById(req.params.id).populate('userId', 'name email isActive');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateStudentStatus = async (req, res, next) => {
  try {
    const { isActive, placementStatus } = req.body;
    const profile = await StudentProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    if (placementStatus) {
      profile.placementStatus = placementStatus;
      await profile.save();
    }

    if (isActive !== undefined) {
      await User.findByIdAndUpdate(profile.userId, { isActive });
    }

    const updated = await StudentProfile.findById(req.params.id).populate('userId', 'name email isActive');
    res.status(200).json({ success: true, message: 'Student status updated.', data: updated });
  } catch (error) {
    next(error);
  }
};
