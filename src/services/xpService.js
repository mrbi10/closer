import api from './api';

export const getXPOverview = async () => {
  const response = await api.get('/xp/summary');
  return response.data;
};

export const awardXP = async payload => {
  const response = await api.post('/xp/award', payload);
  return response.data;
};