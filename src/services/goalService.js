import api from './api';

export const getGoals = async () => {
  const response = await api.get('/goals');
  return response.data;
};

export const updateGoal = async payload => {
  const response = await api.post('/goals/update', payload);
  return response.data;
};