import { create } from 'zustand';
import { createSpace, getMySpaces, joinSpace } from '../services/spaceService';
import { extractErrorMessage } from '../utils/errorHandler';

const normalizeSpaces = payload => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.spaces)) {
    return payload.spaces;
  }
  if (Array.isArray(payload?.data?.spaces)) {
    return payload.data.spaces;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  return [];
};

const normalizeSpace = payload => {
  if (!payload) {
    return null;
  }

  return payload?.space || payload?.data?.space || payload?.data || payload;
};

const useSpaceStore = create((set, get) => ({
  currentSpace: null,
  spaces: [],
  loading: false,
  error: null,

  setCurrentSpace: space => set({ currentSpace: space }),

  fetchSpaces: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getMySpaces();
      const spaces = normalizeSpaces(data);
      set({ spaces, loading: false, error: null });
      return spaces;
    } catch (error) {
      set({
        loading: false,
        error: extractErrorMessage(error, 'Unable to load spaces. Please try again.'),
      });
      throw error;
    }
  },

  createNewSpace: async payload => {
    set({ loading: true, error: null });
    try {
      const data = await createSpace(payload);
      const createdSpace = normalizeSpace(data);

      if (createdSpace) {
        set({ spaces: [createdSpace, ...get().spaces], loading: false, error: null });
      } else {
        set({ loading: false, error: null });
      }

      return data;
    } catch (error) {
      set({
        loading: false,
        error: extractErrorMessage(error, 'Unable to create space. Please try again.'),
      });
      throw error;
    }
  },

  joinExistingSpace: async spaceId => {
    set({ loading: true, error: null });
    try {
      const data = await joinSpace(spaceId);
      const joinedSpace = normalizeSpace(data);

      if (joinedSpace) {
        const existing = get().spaces;
        const nextSpaces = [joinedSpace, ...existing.filter(space => String(space?.id) !== String(joinedSpace?.id))];
        set({ spaces: nextSpaces, loading: false, error: null });
      } else {
        set({ loading: false, error: null });
      }

      return data;
    } catch (error) {
      set({
        loading: false,
        error: extractErrorMessage(error, 'Unable to join space. Please try again.'),
      });
      throw error;
    }
  },
}));

export default useSpaceStore;
