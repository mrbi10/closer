import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const THEME_KEY = 'closer_theme_mode';

const useThemeStore = create(set => ({
  isDarkMode: true,
  hasHydrated: false,
  loading: false,
  error: null,

  hydrateTheme: async () => {
    set({ loading: true, error: null });
    try {
      const storedMode = await AsyncStorage.getItem(THEME_KEY);
      set({
        isDarkMode: storedMode ? storedMode === 'dark' : true,
        loading: false,
        hasHydrated: true,
      });
    } catch {
      set({ isDarkMode: true, loading: false, hasHydrated: true });
    }
  },

  toggleTheme: async () => {
    let nextMode = 'dark';

    set(state => {
      nextMode = state.isDarkMode ? 'light' : 'dark';
      return { isDarkMode: !state.isDarkMode };
    });

    try {
      await AsyncStorage.setItem(THEME_KEY, nextMode);
    } catch (error) {
      set({ error: error?.message || 'Unable to persist theme.' });
    }
  },
}));

export default useThemeStore;