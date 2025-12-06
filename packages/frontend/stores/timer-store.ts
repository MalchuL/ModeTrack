import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimerPhase = "work" | "shortBreak" | "longBreak";

interface TimerState {
  phase: TimerPhase;
  timeLeft: number; // in seconds
  isRunning: boolean;
  completedPomodoros: number; // in current session/day? Resets on long break? 
  // Usually counts up to long_break_interval
  
  // Actions
  setPhase: (phase: TimerPhase, duration: number) => void;
  setTimeLeft: (time: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (duration: number) => void;
  incrementCompleted: () => void;
  resetCompleted: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      phase: "work",
      timeLeft: 25 * 60,
      isRunning: false,
      completedPomodoros: 0,

      setPhase: (phase, duration) => set({ phase, timeLeft: duration, isRunning: false }),
      setTimeLeft: (time) => set({ timeLeft: time }),
      startTimer: () => set({ isRunning: true }),
      pauseTimer: () => set({ isRunning: false }),
      resetTimer: (duration) => set({ timeLeft: duration, isRunning: false }),
      incrementCompleted: () => set((state) => ({ completedPomodoros: state.completedPomodoros + 1 })),
      resetCompleted: () => set({ completedPomodoros: 0 }),
    }),
    {
      name: "pomodoro-timer-storage",
      partialize: (state) => ({ 
        phase: state.phase, 
        completedPomodoros: state.completedPomodoros 
        // Don't persist timeLeft or isRunning to avoid resuming old state on reload
      }), 
    }
  )
);

