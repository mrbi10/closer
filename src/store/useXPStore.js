import { create } from 'zustand';
import { awardXP, getXPOverview } from '../services/xpService';
import { getStreakOverview, submitCheckIn } from '../services/streakService';
import { extractErrorMessage } from '../utils/errorHandler';

const normalizeOverview = payload => payload?.data || payload || {};

const useXPStore = create((set, get) => ({
  totalXp: 0,
  level: 1,
  levelTitle: 'Level 1 • Getting Started',
  currentStreak: 0,
  streakGoal: 7,
  todayProgress: 0,
  loading: false,
  error: null,
  lastReward: null,

  refreshXP: async () => {
    set({ loading: true, error: null });
    try {
      const [xpData, streakData] = await Promise.all([getXPOverview(), getStreakOverview()]);
      const xp = normalizeOverview(xpData);
      const streak = normalizeOverview(streakData);

      set({
        totalXp: xp.totalXp ?? xp.total_xp ?? get().totalXp,
        level: xp.level ?? get().level,
        levelTitle: xp.levelTitle ?? xp.level_title ?? `Level ${xp.level ?? get().level}`,
        currentStreak: streak.currentStreak ?? streak.current_streak ?? get().currentStreak,
        streakGoal: streak.streakGoal ?? streak.streak_goal ?? get().streakGoal,
        todayProgress: streak.todayProgress ?? streak.today_progress ?? get().todayProgress,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({ loading: false, error: extractErrorMessage(error, 'Unable to load XP right now.') });
    }
  },

  awardPoints: async payload => {
    try {
      const data = await awardXP(payload);
      const reward = normalizeOverview(data);
      const earned = reward.xp ?? reward.amount ?? payload?.xp ?? 10;
      const totalXp = get().totalXp + earned;
      set({ totalXp, lastReward: { ...reward, xp: earned } });
      return reward;
    } catch (error) {
      set({ error: extractErrorMessage(error, 'Unable to award XP right now.') });
      throw error;
    }
  },

  submitCheckIn: async payload => {
    try {
      const data = await submitCheckIn(payload);
      await get().refreshXP();
      return data;
    } catch (error) {
      set({ error: extractErrorMessage(error, 'Unable to submit check-in.') });
      throw error;
    }
  },
}));

export default useXPStore;