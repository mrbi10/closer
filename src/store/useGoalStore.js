import { create } from 'zustand';
import { getGoals, updateGoal } from '../services/goalService';
import { extractErrorMessage } from '../utils/errorHandler';

const normalizeGoals = payload => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.goals)) {
    return payload.goals;
  }
  if (Array.isArray(payload?.data?.goals)) {
    return payload.data.goals;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  return [];
};

const useGoalStore = create((set, get) => ({
  goals: [],
  loading: false,
  error: null,

  refreshGoals: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getGoals();
      set({ goals: normalizeGoals(data), loading: false, error: null });
    } catch (error) {
      set({ loading: false, error: extractErrorMessage(error, 'Unable to load goals.') });
    }
  },

  toggleGoal: async goal => {
    const goalId = goal?.id || goal?._id;
    const nextDone = !goal?.done && !goal?.completed ? true : false;
    try {
      await updateGoal({ goalId, completed: nextDone });
      set(state => ({
        goals: state.goals.map(item =>
          String(item?.id || item?._id) === String(goalId) ? { ...item, completed: nextDone, done: nextDone } : item,
        ),
      }));
    } catch (error) {
      set({ error: extractErrorMessage(error, 'Unable to update goal.') });
      throw error;
    }
  },
}));

export default useGoalStore;