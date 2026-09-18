import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Announcement message is required'],
    },
    audience: {
      type: String,
      enum: ['all', 'student', 'recruiter'],
      default: 'all',
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model('Announcement', announcementSchema);
