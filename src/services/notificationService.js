import api from './api';

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationRead = async notificationId => {
  const response = await api.post(`/notifications/${notificationId}/read`);
  return response.data;
};