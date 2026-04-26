import { create } from 'zustand';
import { getActivityFeed, getActivitySummary, logActivity } from '../services/activityService';
import { extractErrorMessage } from '../utils/errorHandler';

const normalizeItems = payload => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.activities)) {
    return payload.activities;
  }
  if (Array.isArray(payload?.data?.activities)) {
    return payload.data.activities;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  return [];
};

const useActivityStore = create((set, get) => ({
  today: { steps: 0, workoutMinutes: 0, sleepHours: 0, financeCheck: false },
  history: [],
  loading: false,
  error: null,

  fetchActivityFeed: async () => {
    set({ loading: true, error: null });
    try {
      const [feedData, summaryData] = await Promise.all([getActivityFeed(), getActivitySummary()]);
      set({
        history: normalizeItems(feedData),
        today: { ...get().today, ...(summaryData?.data || summaryData || {}) },
        loading: false,
        error: null,
      });
    } catch (error) {
      set({ loading: false, error: extractErrorMessage(error, 'Unable to load activities.') });
    }
  },

  logTodayActivity: async payload => {
    try {
      const data = await logActivity(payload);
      set(state => ({
        history: [data?.activity || data?.data?.activity || data?.data || data, ...state.history].filter(Boolean),
      }));
      return data;
    } catch (error) {
      set({ error: extractErrorMessage(error, 'Unable to log activity.') });
      throw error;
    }
  },
}));

export default useActivityStore;