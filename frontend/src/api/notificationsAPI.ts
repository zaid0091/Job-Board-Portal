import axiosInstance from './axiosInstance';
import type { Notification, PaginatedResponse } from '@/types';

export const notificationsAPI = {
  getNotifications: async (page = 1) => {
    const response = await axiosInstance.get<PaginatedResponse<Notification>>(
      '/notifications/',
      { params: { page } },
    );
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await axiosInstance.post<Notification>(
      `/notifications/${id}/mark-read/`,
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.post('/notifications/mark-all-read/');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get<{ unread_count: number }>(
      '/notifications/unread-count/',
    );
    return response.data;
  },
};
