import api from './api';

export const getMySpaces = async () => {
  const response = await api.get('/spaces/my');
  return response.data;
};

export const createSpace = async payload => {
  const response = await api.post('/spaces/create', payload);
  return response.data;
};
