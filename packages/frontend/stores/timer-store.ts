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
  persist(
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
    }),
    {
      name: "pomodoro-timer-storage",
      partialize: (state) => ({ 
        phase: state.phase, 
        completedPomodoros: state.completedPomodoros,
        timeLeft: state.timeLeft,
        isRunning: state.isRunning,
        lastUpdated: state.isRunning ? state.lastUpdated : null,
        sessionStart: state.sessionStart,
        pausedAt: state.pausedAt,
        resumeAllowed: state.resumeAllowed,
        timeSnapshot: state.timeSnapshot,
      }), 
      onRehydrateStorage: () => (state, error) => {
        if (!state) return;
        const { isRunning, lastUpdated, pausedAt, timeSnapshot, resumeAllowed } = state as TimerState;

        // Always restore snapshot
        useTimerStore.setState({ timeLeft: timeSnapshot, timeSnapshot });

        // If paused/reset or resume not allowed, force stop and clear lastUpdated
        if (!isRunning || pausedAt || !lastUpdated || !resumeAllowed) {
          useTimerStore.setState({ isRunning: false, lastUpdated: null, resumeAllowed: false });
          return;
        }

        // If running with a timestamp, reconcile elapsed time
        const elapsedSeconds = Math.max(0, Math.floor((Date.now() - lastUpdated) / 1000));
        if (elapsedSeconds > 0) {
          const updatedTimeLeft = timeSnapshot - elapsedSeconds;
          useTimerStore.setState({
            timeLeft: Math.max(updatedTimeLeft, 0),
            timeSnapshot: Math.max(updatedTimeLeft, 0),
            isRunning: updatedTimeLeft > 0,
            lastUpdated: updatedTimeLeft > 0 ? Date.now() : null,
          });
        }
      },
    }
  )
);

