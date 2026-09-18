import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OTPVerification } from '../models/OTPVerification.js';
import { sendOTPEmail } from './emailService.js';
import { isLiveEmailActive } from '../config/mail.js';
import { env } from '../config/env.js';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 5;

export const generateAndSendOTP = async (email, purpose) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Check recent OTP record for cooldown
  const existingRecord = await OTPVerification.findOne({
    email: normalizedEmail,
    purpose,
    verified: false,
  }).sort({ createdAt: -1 });

  if (existingRecord) {
    const elapsedSinceLastSend = Date.now() - new Date(existingRecord.lastSentAt).getTime();
    if (elapsedSinceLastSend < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - elapsedSinceLastSend) / 1000);
      const error = new Error(`Please wait ${waitSeconds} seconds before requesting a new verification code.`);
      error.statusCode = 429;
      throw error;
    }
  }

  // Generate 6-digit cryptographic OTP
  const rawOtp = crypto.randomInt(100000, 1000000).toString();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(rawOtp, salt);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  // Invalidate previous unverified tokens for this email & purpose
  await OTPVerification.deleteMany({ email: normalizedEmail, purpose });

  // Save new OTP record
  await OTPVerification.create({
    email: normalizedEmail,
    purpose,
    otpHash,
    expiresAt,
    attempts: 0,
    lastSentAt: new Date(),
    verified: false,
  });

  // Dispatch Email
  await sendOTPEmail(normalizedEmail, rawOtp, purpose);

  const isLive = isLiveEmailActive();

  return {
    email: normalizedEmail,
    expiresInMinutes: 5,
    cooldownSeconds: 60,
    isLiveEmail: isLive,
    ...(isLive ? {} : { devCode: rawOtp }),
  };
};

export const verifyOTP = async (email, purpose, enteredOtp) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (!enteredOtp || enteredOtp.trim().length !== 6) {
    const error = new Error('Verification code must be exactly 6 digits.');
    error.statusCode = 400;
    throw error;
  }

  const cleanOtp = enteredOtp.trim();

  const record = await OTPVerification.findOne({
    email: normalizedEmail,
    purpose,
    verified: false,
  }).sort({ createdAt: -1 });

  if (!record) {
    const error = new Error('No active verification code found. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  // Check Expiration
  if (new Date() > new Date(record.expiresAt)) {
    await OTPVerification.deleteOne({ _id: record._id });
    const error = new Error('Verification code has expired. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  // Check Attempt Limits
  if (record.attempts >= MAX_ATTEMPTS) {
    await OTPVerification.deleteOne({ _id: record._id });
    const error = new Error('Maximum verification attempts exceeded. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  // Check OTP Match
  const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);
  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    const remaining = MAX_ATTEMPTS - record.attempts;
    const error = new Error(`Invalid verification code. ${remaining} attempts remaining.`);
    error.statusCode = 400;
    throw error;
  }

  // Mark verified & clean up
  record.verified = true;
  await record.save();
  await OTPVerification.deleteMany({ email: normalizedEmail, purpose });

  return true;
};
