import { create } from "zustand";

export type TimerPhase = "work" | "shortBreak" | "longBreak";

interface TimerState {
  phase: TimerPhase;
  timeLeft: number; // in seconds
  isRunning: boolean;
  completedPomodoros: number; // in current session/day? Resets on long break? 
  // Usually counts up to long_break_interval
  lastUpdated: number | null; // timestamp of last tick to allow resume after reload
  sessionStart: number | null; // when current phase started (ms)
  pausedAt: number | null; // when user last paused (ms)
  resumeAllowed: boolean; // whether we should resume on hydration if running
  timeSnapshot: number; // persisted snapshot of timeLeft to restore without drift
  
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
  (set, get) => ({
    phase: "work",
    timeLeft: 25 * 60,
    isRunning: false,
    completedPomodoros: 0,
    lastUpdated: null,
    sessionStart: null,
    pausedAt: null,
    resumeAllowed: false,
    timeSnapshot: 25 * 60,

    setPhase: (phase, duration) =>
      set({
        phase,
        timeLeft: duration,
        timeSnapshot: duration,
        isRunning: false,
        lastUpdated: null,
        sessionStart: null,
        pausedAt: null,
        resumeAllowed: false,
      }),
    setTimeLeft: (time) =>
      set((state) => ({
        timeLeft: typeof time === "function" ? time(state.timeLeft) : time,
        timeSnapshot: typeof time === "function" ? time(state.timeLeft) : time,
        lastUpdated: state.isRunning ? Date.now() : state.lastUpdated,
      })),
    startTimer: () =>
      set((state) => ({
        isRunning: true,
        lastUpdated: Date.now(),
        sessionStart: state.sessionStart ?? Date.now(),
        pausedAt: null,
        resumeAllowed: true,
      })),
    pauseTimer: () =>
      set({
        isRunning: false,
        lastUpdated: null,
        pausedAt: Date.now(),
        resumeAllowed: false,
      }),
    resetTimer: (duration) =>
      set({
        timeLeft: duration,
        timeSnapshot: duration,
        isRunning: false,
        lastUpdated: null,
        sessionStart: null,
        pausedAt: null,
        resumeAllowed: false,
      }),
    incrementCompleted: () => set((state) => ({ completedPomodoros: state.completedPomodoros + 1 })),
    resetCompleted: () => set({ completedPomodoros: 0 }),
  })
);

