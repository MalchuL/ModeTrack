import { create } from "zustand";
import { AudioTrack } from "@/types/playlist";

interface AudioState {
  currentTrack: AudioTrack | null;
  queue: AudioTrack[];
  originalQueue: AudioTrack[]; // To restore after shuffle
  isPlaying: boolean;
  isShuffled: boolean;
  volume: number; // 0-1
  
  // Actions
  setQueue: (tracks: AudioTrack[]) => void;
  playTrack: (track: AudioTrack) => void;
  togglePlay: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentTrack: null,
  queue: [],
  originalQueue: [],
  isPlaying: false,
  isShuffled: false,
  volume: 1,

  setQueue: (tracks) => {
    const { isShuffled } = get();
    set({ 
      originalQueue: tracks,
      queue: isShuffled ? shuffleArray([...tracks]) : tracks 
    });
  },

  playTrack: (track) => {
    set({ currentTrack: track, isPlaying: true });
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
  },

  nextTrack: () => {
    const { queue, currentTrack } = get();
    if (!currentTrack) return;
    
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    if (idx === -1 || idx === queue.length - 1) {
       // End of queue, loop or stop? Let's loop for continuous background music
       if (queue.length > 0) {
         set({ currentTrack: queue[0], isPlaying: true });
       } else {
         set({ isPlaying: false });
       }
    } else {
      set({ currentTrack: queue[idx + 1], isPlaying: true });
    }
  },

  prevTrack: () => {
    const { queue, currentTrack } = get();
    if (!currentTrack) return;
    
    const idx = queue.findIndex(t => t.id === currentTrack.id);
    if (idx <= 0) {
       // Start of queue
       if (queue.length > 0) {
         set({ currentTrack: queue[queue.length - 1], isPlaying: true });
       }
    } else {
      set({ currentTrack: queue[idx - 1], isPlaying: true });
    }
  },

  setVolume: (volume) => set({ volume }),

  toggleShuffle: () => {
    const { isShuffled, originalQueue, currentTrack } = get();
    const newIsShuffled = !isShuffled;
    
    if (newIsShuffled) {
      // Shuffle
      const shuffled = shuffleArray([...originalQueue]);
      // If playing, keep current track at front or just find it in new queue?
      // Simplest: just shuffle. If current track plays, it plays.
      // Better: move current track to top if playing.
      set({ isShuffled: true, queue: shuffled });
    } else {
      // Restore
      set({ isShuffled: false, queue: originalQueue });
    }
  }
}));

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

