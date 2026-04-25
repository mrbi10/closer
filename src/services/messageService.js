import api from './api';

export const getMessagesBySpace = async spaceId => {
  const response = await api.get(`/messages/${spaceId}`);
  return response.data;
};

export const sendMessageToSpace = async payload => {
  const response = await api.post('/messages/send', payload);
  return response.data;
};
