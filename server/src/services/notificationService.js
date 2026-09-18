import { Notification } from '../models/Notification.js';

export const createNotification = async ({ userId, title, message, type = 'system' }) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      isRead: false,
    });
    return notification;
  } catch (error) {
    console.error(`[Notification Error] Failed to create notification for user ${userId}:`, error.message);
  }
};

export const broadcastNotification = async (userIds, { title, message, type = 'announcement' }) => {
  try {
    const records = userIds.map((userId) => ({
      userId,
      title,
      message,
      type,
      isRead: false,
    }));
    if (records.length > 0) {
      await Notification.insertMany(records);
    }
  } catch (error) {
    console.error('[Notification Error] Failed to broadcast notifications:', error.message);
  }
};
