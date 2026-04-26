import api from './api';

export const getStreakOverview = async () => {
  const response = await api.get('/streaks/summary');
  return response.data;
};

export const submitCheckIn = async payload => {
  const response = await api.post('/streaks/check-in', payload);
  return response.data;
};