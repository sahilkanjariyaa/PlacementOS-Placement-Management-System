import { Announcement } from '../models/Announcement.js';
import { User } from '../models/User.js';
import { broadcastNotification } from '../services/notificationService.js';

export const getAnnouncements = async (req, res, next) => {
  try {
    const query = { isPublished: true };

    if (req.user && req.user.role !== 'admin') {
      query.audience = { $in: ['all', req.user.role] };
    }

    const announcements = await Announcement.find(query)
      .populate('publishedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, audience } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      audience: audience || 'all',
      publishedBy: req.user.userId,
      isPublished: true,
    });

    // Notify targeted users
    const userQuery = { isActive: true };
    if (audience && audience !== 'all') {
      userQuery.role = audience;
    }
    const targetUsers = await User.find(userQuery).select('_id');
    await broadcastNotification(
      targetUsers.map((u) => u._id),
      {
        title: `Official Notice: ${title}`,
        message: message.slice(0, 120) + (message.length > 120 ? '...' : ''),
        type: 'announcement',
      }
    );

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const { title, message, audience, isPublished } = req.body;
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    if (title) announcement.title = title.trim();
    if (message) announcement.message = message.trim();
    if (audience) announcement.audience = audience;
    if (isPublished !== undefined) announcement.isPublished = isPublished;

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated.',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }
    res.status(200).json({
      success: true,
      message: 'Announcement deleted.',
    });
  } catch (error) {
    next(error);
  }
};
