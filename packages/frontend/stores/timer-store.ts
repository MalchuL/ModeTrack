import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimerPhase = "work" | "shortBreak" | "longBreak";

interface TimerState {
  phase: TimerPhase;
  timeLeft: number; // in seconds
  isRunning: boolean;
  completedPomodoros: number; // in current session/day? Resets on long break? 
  // Usually counts up to long_break_interval
  lastUpdated: number | null; // timestamp of last tick to allow resume after reload
  
  // Actions
  setPhase: (phase: TimerPhase, duration: number) => void;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (duration: number) => void;
  incrementCompleted: () => void;
  resetCompleted: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      phase: "work",
      timeLeft: 25 * 60,
      isRunning: false,
      completedPomodoros: 0,
      lastUpdated: Date.now(),

      setPhase: (phase, duration) =>
        set({ phase, timeLeft: duration, isRunning: false, lastUpdated: Date.now() }),
      setTimeLeft: (time) =>
        set((state) => ({
          timeLeft: typeof time === "function" ? time(state.timeLeft) : time,
          lastUpdated: Date.now(),
        })),
      startTimer: () => set({ isRunning: true, lastUpdated: Date.now() }),
      pauseTimer: () => set({ isRunning: false, lastUpdated: null }),
      resetTimer: (duration) => set({ timeLeft: duration, isRunning: false, lastUpdated: Date.now() }),
      incrementCompleted: () => set((state) => ({ completedPomodoros: state.completedPomodoros + 1 })),
      resetCompleted: () => set({ completedPomodoros: 0 }),
    }),
    {
      name: "pomodoro-timer-storage",
      partialize: (state) => ({ 
        phase: state.phase, 
        completedPomodoros: state.completedPomodoros,
        timeLeft: state.timeLeft,
        isRunning: state.isRunning,
        lastUpdated: state.lastUpdated,
      }), 
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const { isRunning, lastUpdated, timeLeft } = state;
        if (isRunning && lastUpdated) {
          const elapsedSeconds = Math.max(0, Math.floor((Date.now() - lastUpdated) / 1000));
          if (elapsedSeconds > 0) {
            const updatedTimeLeft = timeLeft - elapsedSeconds;
            set((current) => ({
              ...current,
              timeLeft: Math.max(updatedTimeLeft, 0),
              isRunning: updatedTimeLeft > 0 ? current.isRunning : false,
              lastUpdated: Date.now(),
            }));
          }
        }
      },
    }
  )
);

