import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    driveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drive',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'test', 'interview', 'selected', 'rejected'],
      default: 'applied',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      default: '',
    },
    resultDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound Unique Index to prevent duplicate applications
applicationSchema.index({ driveId: 1, studentId: 1 }, { unique: true });

export const Application = mongoose.model('Application', applicationSchema);
