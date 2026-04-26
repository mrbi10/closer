import api from './api';

export const getActivityFeed = async () => {
  const response = await api.get('/activities');
  return response.data;
};

export const logActivity = async payload => {
  const response = await api.post('/activities/log', payload);
  return response.data;
};

export const getActivitySummary = async () => {
  const response = await api.get('/activities/summary');
  return response.data;
};