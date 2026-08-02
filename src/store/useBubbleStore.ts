import { create } from 'zustand';

interface BubbleStore {
  isBubbleModeActive: boolean;
  poppedCount: number;
  toggleBubbleMode: () => void;
  setBubbleMode: (active: boolean) => void;
  incrementPoppedCount: () => void;
}

export const useBubbleStore = create<BubbleStore>((set) => ({
  isBubbleModeActive: false,
  poppedCount: 0,
  toggleBubbleMode: () => set((state) => ({ isBubbleModeActive: !state.isBubbleModeActive })),
  setBubbleMode: (active: boolean) => set({ isBubbleModeActive: active }),
  incrementPoppedCount: () => set((state) => ({ poppedCount: state.poppedCount + 1 })),
}));
