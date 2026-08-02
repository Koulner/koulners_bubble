import { create } from 'zustand';

export interface TrackState {
  url: string;
  volume: number;
  isPlaying: boolean;
}

interface AudioStoreState {
  activeTracks: Record<string, TrackState>;
  toggleTrack: (id: string, url: string) => void;
  setTrackVolume: (id: string, volume: number) => void;
  stopAll: () => void;
}

export const useAudioStore = create<AudioStoreState>((set) => ({
  activeTracks: {},

  toggleTrack: (id, url) => set((state) => {
    const prev = state.activeTracks;
    const newState = { ...prev };
    if (newState[id]) {
      newState[id].isPlaying = !newState[id].isPlaying;
      if (!newState[id].isPlaying) {
        delete newState[id];
      }
    } else {
      newState[id] = { url, volume: 0.5, isPlaying: true };
    }
    return { activeTracks: newState };
  }),

  setTrackVolume: (id, volume) => set((state) => {
    const prev = state.activeTracks;
    if (!prev[id]) return state;
    return {
      activeTracks: {
        ...prev,
        [id]: { ...prev[id], volume },
      },
    };
  }),

  stopAll: () => set({ activeTracks: {} }),
}));
