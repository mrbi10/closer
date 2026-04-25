import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../services/authService';
import { setAuthToken } from '../services/api';
import { extractErrorMessage } from '../utils/errorHandler';

const AUTH_TOKEN_KEY = 'closer_auth_token';
const AUTH_USER_KEY = 'closer_auth_user';

const extractAuthPayload = data => {
  const token = data?.token || data?.data?.token || data?.accessToken || null;
  const user = data?.user || data?.data?.user || null;
  return { token, user };
};

const useAuthStore = create(set => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  hasHydrated: false,

  persistAuth: async (token, user) => {
    if (!token) {
      return;
    }

    await AsyncStorage.multiSet([
      [AUTH_TOKEN_KEY, token],
      [AUTH_USER_KEY, JSON.stringify(user || null)],
    ]);
    setAuthToken(token);
    set({ token, user: user || null });
  },

  clearAuth: async () => {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
    setAuthToken(null);
    set({ token: null, user: null });
  },

  hydrateAuth: async () => {
    set({ loading: true, error: null });
    try {
      const [[, storedToken], [, storedUser]] = await AsyncStorage.multiGet([
        AUTH_TOKEN_KEY,
        AUTH_USER_KEY,
      ]);

      const user = storedUser ? JSON.parse(storedUser) : null;

      if (storedToken) {
        setAuthToken(storedToken);
        set({ token: storedToken, user, loading: false, hasHydrated: true });
      } else {
        setAuthToken(null);
        set({ token: null, user: null, loading: false, hasHydrated: true });
      }
    } catch (error) {
      setAuthToken(null);
      set({
        token: null,
        user: null,
        loading: false,
        hasHydrated: true,
        error: extractErrorMessage(error, 'Failed to restore session.'),
      });
    }
  },

  login: async credentials => {
    set({ loading: true, error: null });
    try {
      const data = await loginUser(credentials);
      const { token, user } = extractAuthPayload(data);

      if (!token) {
        throw new Error('Login succeeded but token is missing in response.');
      }

      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, token],
        [AUTH_USER_KEY, JSON.stringify(user || null)],
      ]);
      setAuthToken(token);
      set({ token, user, loading: false, error: null });
      return data;
    } catch (error) {
      set({ loading: false, error: extractErrorMessage(error, 'Login failed. Please try again.') });
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
      setAuthToken(null);
      set({ user: null, token: null, loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: extractErrorMessage(error, 'Logout failed. Please retry.') });
      throw error;
    }
  },
}));

export default useAuthStore;
