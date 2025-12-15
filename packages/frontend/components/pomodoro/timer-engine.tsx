// Headless engine to keep the pomodoro ticking across routes.
"use client";

import { useEffect, useState } from "react";
import { playNotificationSound } from "@/lib/audio";
import { DEFAULT_NOTIFICATION_SOUND } from "@/constants/pomodoro";
import { usePomodoroSettings, useLogPomodoroSession } from "@/hooks/use-pomodoro";
import { TimerPhase, useTimerStore } from "@/stores/timer-store";

// This component renders nothing but mounts globally (see providers.tsx).
// It keeps the timer running even when the pomodoro page is not active.
export function TimerEngine() {
  const {
    phase,
    timeLeft,
    isRunning,
    completedPomodoros,
    sessionStart,
    lastUpdated,
    pausedAt,
    setPhase,
    setTimeLeft,
    startTimer,
    pauseTimer,
    resetTimer,
    incrementCompleted,
  } = useTimerStore();

  const { data: settings } = usePomodoroSettings();
  const logSession = useLogPomodoroSession();
  const [hydrated, setHydrated] = useState(() => useTimerStore.persist.hasHydrated?.() ?? false);

  // Track when zustand persistence finishes hydration
  useEffect(() => {
    const unsub = useTimerStore.persist.onFinish?.(() => setHydrated(true));
    return () => unsub?.();
  }, []);

  // Derived durations from settings (fall back to defaults).
  const workDuration = (settings?.work_duration_minutes ?? 25) * 60;
  const shortBreakDuration = (settings?.short_break_minutes ?? 5) * 60;
  const longBreakDuration = (settings?.long_break_minutes ?? 15) * 60;
  const longBreakInterval = settings?.long_break_interval ?? 4;

  const getPhaseDuration = (p: TimerPhase) => {
    switch (p) {
      case "work":
        return workDuration;
      case "shortBreak":
        return shortBreakDuration;
      case "longBreak":
        return longBreakDuration;
    }
  };

  // Hydrate elapsed time after reload/navigation.
  useEffect(() => {
    if (!hydrated) return;
    if (!isRunning || !lastUpdated || pausedAt) return;
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - lastUpdated) / 1000));
    if (elapsedSeconds === 0) return;
    setTimeLeft((prev) => Math.max(prev - elapsedSeconds, 0));
  }, [hydrated, isRunning, lastUpdated, pausedAt, setTimeLeft]);

  // If storage said running but we lost timestamp, force pause to avoid phantom resume.
  useEffect(() => {
    if (!hydrated) return;
    if (isRunning && (!lastUpdated || pausedAt)) {
      pauseTimer();
    }
  }, [hydrated, isRunning, lastUpdated, pausedAt, pauseTimer]);

  // Ticking loop
  useEffect(() => {
    if (!hydrated) return;
    if (!isRunning) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [hydrated, isRunning, setTimeLeft]);

  // Completion handling
  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft > 0) return;
    handleCompletion();
  }, [timeLeft, isRunning]);

  const handleCompletion = () => {
    pauseTimer();
    if (settings?.sound_enabled) {
      playNotificationSound(DEFAULT_NOTIFICATION_SOUND);
    }

    const now = new Date();
    const startedAt = sessionStart ? new Date(sessionStart) : new Date(now.getTime() - getPhaseDuration(phase) * 1000);

    if (phase === "work") {
      // Log completed work session
      logSession.mutate({
        start_time: startedAt.toISOString(),
        end_time: now.toISOString(),
        duration_minutes: settings?.work_duration_minutes ?? 25,
        completed: true,
      });

      incrementCompleted();

      const nextIsLongBreak = (completedPomodoros + 1) % longBreakInterval === 0;
      if (nextIsLongBreak) {
        setPhase("longBreak", longBreakDuration);
      } else {
        setPhase("shortBreak", shortBreakDuration);
      }

      if (settings?.auto_start_breaks) {
        startTimer();
      }
    } else {
      setPhase("work", workDuration);
      if (settings?.auto_start_pomodoros) {
        startTimer();
      }
    }
  };

  return null;
}

