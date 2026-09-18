import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ['signup', 'login'],
      required: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// TTL index to automatically purge expired tokens after 1 hour
otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });
otpVerificationSchema.index({ email: 1, purpose: 1 });

export const OTPVerification = mongoose.model('OTPVerification', otpVerificationSchema);
