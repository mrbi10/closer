import axios from 'axios';

const API_BASE_URL = 'http://192.168.29.235:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

let authToken = null;

export const setAuthToken = token => {
  authToken = token;
};

api.interceptors.request.use(
  config => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

export default api;
