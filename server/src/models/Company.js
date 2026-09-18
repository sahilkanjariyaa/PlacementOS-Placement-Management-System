import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    website: {
      type: String,
      required: [true, 'Website URL is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    hrName: {
      type: String,
      required: [true, 'HR contact name is required'],
      trim: true,
    },
    hrEmail: {
      type: String,
      required: [true, 'HR email is required'],
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Company = mongoose.model('Company', companySchema);
