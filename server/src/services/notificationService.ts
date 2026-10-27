import mongoose from 'mongoose';
import Notification from '../models/Notification';

export const createNotification = async (
  userId: string | mongoose.Types.ObjectId,
  message: string,
  issueId?: string | mongoose.Types.ObjectId
) => {
  try {
    const notification = await Notification.create({
      user: userId,
      issue: issueId || null,
      message,
      read: false,
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error);
    return null;
  }
};
