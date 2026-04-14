import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsAPI } from '@/api';
import type { Notification, PaginatedResponse } from '@/types';

interface NotificationsState {
  notifications: PaginatedResponse<Notification> | null;
  unreadCount: number;
  isLoading: boolean;
}

const initialState: NotificationsState = {
  notifications: null,
  unreadCount: 0,
  isLoading: false,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (page: number = 1) => {
    return await notificationsAPI.getNotifications(page);
  },
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/unreadCount',
  async () => {
    const data = await notificationsAPI.getUnreadCount();
    return data.unread_count;
  },
);

export const markAllRead = createAsyncThunk(
  'notifications/markAllRead',
  async () => {
    await notificationsAPI.markAllAsRead();
  },
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    fakeOptimistic: (state, action) => {
      if (state.notifications) {
        state.notifications.results = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.isLoading = false;
      state.notifications = action.payload;
    });
    builder.addCase(fetchNotifications.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });

    builder.addCase(markAllRead.fulfilled, (state) => {
      state.unreadCount = 0;
      if (state.notifications) {
        state.notifications.results = state.notifications.results.map((n) => ({
          ...n,
          is_read: true,
        }));
      }
    });
  },
});

export default notificationsSlice.reducer;
