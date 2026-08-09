import { create } from 'zustand';

interface UiState {
  loadingCount: number;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  loadingCount: 0,
  startLoading: () => set((state) => ({ loadingCount: state.loadingCount + 1 })),
  stopLoading: () => set((state) => ({ loadingCount: Math.max(0, state.loadingCount - 1) })),
}));
