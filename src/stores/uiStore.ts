import { create } from 'zustand';

interface UIState {
  preselectedBatchId: string | null;
  setPreselectedBatchId: (id: string | null) => void;
  clearPreselectedBatchId: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  preselectedBatchId: null,
  setPreselectedBatchId: (id) => set({ preselectedBatchId: id }),
  clearPreselectedBatchId: () => set({ preselectedBatchId: null }),
}));
