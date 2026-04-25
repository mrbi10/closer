import api from './api';

export const getItemsBySpace = async spaceId => {
  const response = await api.get(`/items/${spaceId}`);
  return response.data;
};

export const createItem = async payload => {
  const response = await api.post('/items/create', payload);
  return response.data;
};
