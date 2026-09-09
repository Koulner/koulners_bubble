import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BubbleStore {
  isBubbleModeActive: boolean;
  poppedCount: number;
  isVisitorEnabled: boolean;
  toggleBubbleMode: () => void;
  setBubbleMode: (active: boolean) => void;
  incrementPoppedCount: () => void;
  toggleVisitorEnabled: () => void;
}

export const useBubbleStore = create<BubbleStore>()(
  persist(
    (set) => ({
      isBubbleModeActive: false,
      poppedCount: 0,
      isVisitorEnabled: true,
      toggleBubbleMode: () => set((state) => ({ isBubbleModeActive: !state.isBubbleModeActive })),
      setBubbleMode: (active: boolean) => set({ isBubbleModeActive: active }),
      incrementPoppedCount: () => set((state) => ({ poppedCount: state.poppedCount + 1 })),
      toggleVisitorEnabled: () => set((state) => ({ isVisitorEnabled: !state.isVisitorEnabled })),
    }),
    {
      name: 'bubble-storage',
      partialize: (state) => ({ 
        isVisitorEnabled: state.isVisitorEnabled, 
        poppedCount: state.poppedCount 
      }),
    }
  )
);
