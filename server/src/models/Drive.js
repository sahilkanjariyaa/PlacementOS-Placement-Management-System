import mongoose from 'mongoose';

const driveSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Drive title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Drive description is required'],
    },
    package: {
      type: Number,
      required: [true, 'CTC package in LPA is required'],
      min: [0, 'Package must be positive'],
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['full_time', 'internship', 'intern_plus_ft'],
      default: 'full_time',
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    minCgpa: {
      type: Number,
      required: [true, 'Minimum CGPA threshold is required'],
      min: 0,
      max: 10,
      default: 6.0,
    },
    eligibleDepartments: {
      type: [String],
      required: [true, 'Eligible departments must be specified'],
      default: ['Computer Science', 'Information Technology'],
    },
    maxBacklogs: {
      type: Number,
      required: [true, 'Maximum backlogs permitted is required'],
      min: 0,
      default: 0,
    },
    eligibleSemesters: {
      type: [Number],
      default: [7, 8],
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'completed'],
      default: 'open',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

driveSchema.index({ status: 1, deadline: 1 });

export const Drive = mongoose.model('Drive', driveSchema);
