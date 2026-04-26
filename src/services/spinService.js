import api from './api';

export const getSpinPrompts = async () => {
  const response = await api.get('/spin');
  return response.data;
};

export const recordSpinResult = async payload => {
  const response = await api.post('/spin/resolve', payload);
  return response.data;
};