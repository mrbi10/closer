import api from './api';

export const getMySpaces = async () => {
  const response = await api.get('/spaces/my');
  return response.data;
};

export const createSpace = async payload => {
  const normalizedPayload = {
    type: 'group',
    ...payload,
  };

  const response = await api.post('/spaces/create', normalizedPayload);
  return response.data;
};

export const joinSpace = async spaceId => {
  const response = await api.post('/spaces/join', { spaceId });
  return response.data;
};

export const getSpaceMembers = async spaceId => {
  const response = await api.get(`/space-members/${spaceId}`);
  return response.data;
};
