import api from './api';
import { NotificationItem } from '../types';

export const notificationService = {
  getNotifications: async (): Promise<{ success: boolean; unreadCount: number; notifications: NotificationItem[] }> => {
    const res = await api.get('/notifications');
    return res.data;
  },

  markAsRead: async (id: string): Promise<{ success: boolean; notification: NotificationItem }> => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
};

export const dashboardService = {
  getStats: async (): Promise<{ success: boolean; data: any }> => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
};
