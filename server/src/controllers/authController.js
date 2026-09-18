import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { Company } from '../models/Company.js';
import { generateAndSendOTP, verifyOTP } from '../services/otpService.js';
import { env } from '../config/env.js';

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      email: user.email,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matching JWT session duration)
  });
};

export const requestSignupOtp = async (req, res, next) => {
  try {
    const { name, email, role = 'student' } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Prevent unauthorized attempt to register admin emails through public signup
    if (normalizedEmail.startsWith('admin@') || normalizedEmail.includes('placementofficer') || normalizedEmail.includes('administrator')) {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot be registered publicly. Please contact system administrators.',
      });
    }

    // Check if account already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account with email "${normalizedEmail}" already exists as a ${existingUser.role.toUpperCase()}. Please sign in instead.`,
      });
    }

    const otpData = await generateAndSendOTP(normalizedEmail, 'signup');

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
      data: otpData,
    });
  } catch (error) {
    next(error);
  }
};

export const verifySignupOtp = async (req, res, next) => {
  try {
    const { name, email, otp, role = 'student', companyName, industry, location: compLocation } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP
    await verifyOTP(normalizedEmail, 'signup', otp);

    // Double check user doesn't already exist
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Account already exists. Please log in.',
      });
    }

    // Security check: Never allow arbitrary public admin creation
    const assignedRole = role === 'recruiter' ? 'recruiter' : 'student';

    let companyId = null;
    if (assignedRole === 'recruiter') {
      const finalCompanyName = (companyName || `${name.trim()}'s Organization`).trim();
      let company = await Company.findOne({ name: finalCompanyName });
      if (!company) {
        company = await Company.create({
          name: finalCompanyName,
          industry: industry ? industry.trim() : 'Technology & Services',
          location: compLocation ? compLocation.trim() : 'Bengaluru, India',
          website: `https://${finalCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.example.com`,
          hrName: name.trim(),
          hrEmail: normalizedEmail,
          isActive: true,
        });
      }
      companyId = company._id;
    }

    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      role: assignedRole,
      companyId: companyId || null,
      isActive: true,
    });

    if (assignedRole === 'student') {
      // Create fresh, blank StudentProfile for real student data entry
      await StudentProfile.create({
        userId: user._id,
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
    }

    const token = generateToken(user);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully! Welcome to PlacementOS.',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId || null,
          company: companyId ? { _id: companyId, name: companyName || `${name.trim()}'s Organization` } : null,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const requestLoginOtp = async (req, res, next) => {
  try {
    const { email, expectedRole } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Verify user exists and is active
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const roleHint = expectedRole ? `${expectedRole.toUpperCase()} ` : '';
      return res.status(404).json({
        success: false,
        message: `No ${roleHint}account found with email "${normalizedEmail}". Please verify your email or register.`,
      });
    }

    // Role-specific enforcement: Prevent cross-role login confusion
    if (expectedRole && user.role !== expectedRole) {
      const roleNames = {
        student: 'Student Portal',
        admin: 'Placement Cell (Admin)',
        recruiter: 'Corporate Recruiter',
      };
      return res.status(400).json({
        success: false,
        message: `Email "${normalizedEmail}" is registered as a ${user.role.toUpperCase()} account. Please switch to the "${roleNames[user.role] || user.role}" tab to log in.`,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact the administrator.',
      });
    }

    const otpData = await generateAndSendOTP(normalizedEmail, 'login');

    res.status(200).json({
      success: true,
      message: `A login verification code has been dispatched to ${normalizedEmail}.`,
      data: {
        ...otpData,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyLoginOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP
    await verifyOTP(normalizedEmail, 'login', otp);

    const user = await User.findOne({ email: normalizedEmail }).populate('companyId', 'name industry location');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Contact admin.',
      });
    }

    const token = generateToken(user);
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId?._id || user.companyId || null,
          company: user.companyId || null,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email, purpose = 'login' } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    if (!['signup', 'login'].includes(purpose)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP purpose specified.' });
    }

    if (purpose === 'login') {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
    }

    const otpData = await generateAndSendOTP(normalizedEmail, purpose);

    res.status(200).json({
      success: true,
      message: `New verification code dispatched to ${normalizedEmail}.`,
      data: otpData,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).populate('companyId', 'name industry location');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          company: user.companyId || null,
          companyId: user.companyId?._id || user.companyId || null,
        },
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
