import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    enrollmentNo: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: null,
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    backlogs: {
      type: Number,
      min: 0,
      default: 0,
    },
    phone: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    placementStatus: {
      type: String,
      enum: ['unplaced', 'placed', 'opted_out'],
      default: 'unplaced',
    },
  },
  { timestamps: true }
);

// Enforce unique enrollment number only when populated (allows multiple uninitialized new student signups)
studentProfileSchema.index(
  { enrollmentNo: 1 },
  {
    unique: true,
    partialFilterExpression: { enrollmentNo: { $type: 'string', $gt: '' } },
  }
);

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
