import { create } from 'zustand';

interface BubbleState {
  isBubbleModeActive: boolean;
  toggleBubbleMode: () => void;
}

export const useBubbleStore = create<BubbleState>((set) => ({
  isBubbleModeActive: false,
  toggleBubbleMode: () => set((state) => ({ isBubbleModeActive: !state.isBubbleModeActive })),
}));
