import { create } from 'zustand';
import { getNotifications, markNotificationRead } from '../services/notificationService';
import { extractErrorMessage } from '../utils/errorHandler';

const normalizeNotifications = payload => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.notifications)) {
    return payload.notifications;
  }
  if (Array.isArray(payload?.data?.notifications)) {
    return payload.data.notifications;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  return [];
};

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  refreshNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getNotifications();
      const notifications = normalizeNotifications(data);
      const unreadCount = notifications.filter(item => !item?.read && !item?.isRead).length;
      set({ notifications, unreadCount, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: extractErrorMessage(error, 'Unable to load notifications.') });
    }
  },

  markRead: async notificationId => {
    try {
      await markNotificationRead(notificationId);
      set(state => {
        const notifications = state.notifications.map(notification =>
          String(notification?.id || notification?._id) === String(notificationId)
            ? { ...notification, read: true, isRead: true }
            : notification,
        );
        return {
          notifications,
          unreadCount: notifications.filter(item => !item?.read && !item?.isRead).length,
        };
      });
    } catch (error) {
      set({ error: extractErrorMessage(error, 'Unable to update notification.') });
      throw error;
    }
  },
}));

export default useNotificationStore;