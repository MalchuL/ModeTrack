import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePomodoroTimer, useStartPomodoroTimer, usePausePomodoroTimer, useResetPomodoroTimer } from "@/hooks/use-pomodoro";
import type { PomodoroTimerState } from "@/types/pomodoro";

// Helper to format MM:SS
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

interface TimerProps {
  onOpenSettings: () => void;
}

export function Timer({ onOpenSettings }: TimerProps) {
  const defaultWork = 25 * 60;
  const defaultBreak = 5 * 60;

  const { data: remoteState, isFetching, isLoading, refetch } = usePomodoroTimer();
  const startTimer = useStartPomodoroTimer();
  const pauseTimer = usePausePomodoroTimer();
  const resetTimer = useResetPomodoroTimer();

  const [viewState, setViewState] = useState<PomodoroTimerState | undefined>(remoteState);

  const phase = viewState?.phase ?? "work";
  const isRunning = viewState?.is_running ?? false;
  const status = viewState?.status ?? "not_started";

  const [timeLeft, setTimeLeft] = useState(defaultWork);

  const deriveRemaining = (state: typeof remoteState | undefined) => {
    if (!state) {
      return phase === "work" ? defaultWork : defaultBreak;
    }
    const remainingFromState = state.remaining_seconds ?? 0;
    if (state.is_running && state.ends_at) {
      const diff = Math.floor((new Date(state.ends_at).getTime() - Date.now()) / 1000);
      return Math.max(0, diff > 0 ? diff : remainingFromState);
    }
    return remainingFromState;
  };

  // Sync local display with backend snapshot
  useEffect(() => {
    if (!remoteState) return;
    setViewState(remoteState);
    setTimeLeft(deriveRemaining(remoteState));
  }, [remoteState]);

  // Local ticking for smooth UX between polls
  useEffect(() => {
    if (!viewState?.is_running) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [viewState?.is_running]);

  const phaseDuration = useMemo(() => (phase === "work" ? defaultWork : defaultBreak), [phase]);

  const handleStart = async () => {
    if (!remoteState) {
      await refetch();
    }
    const duration = timeLeft > 0 ? timeLeft : phaseDuration;
    const result = await startTimer.mutateAsync({
      phase,
      duration_seconds: duration,
      state_id: (viewState ?? remoteState)?.id,
    });
    setViewState(result);
    setTimeLeft(deriveRemaining(result));
  };

  const handlePause = async () => {
    if (!(viewState ?? remoteState)?.id) {
      await refetch();
      return;
    }
    const result = await pauseTimer.mutateAsync({ state_id: (viewState ?? remoteState)!.id });
    setViewState(result);
    setTimeLeft(deriveRemaining(result));
  };

  const handleReset = async () => {
    const duration = phaseDuration;
    const result = await resetTimer.mutateAsync({
      phase,
      duration_seconds: duration,
      state_id: (viewState ?? remoteState)?.id,
    });
    setViewState(result);
    setTimeLeft(deriveRemaining(result));
  };

  const progress = Math.min(
    100,
    Math.max(0, ((phaseDuration - timeLeft) / phaseDuration) * 100),
  );

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8">
      {/* Timer Display */}
      <div className="relative flex items-center justify-center">
        <svg className="w-64 h-64 transform -rotate-90">
          <circle
            cx="128" cy="128" r="120"
            stroke="currentColor" strokeWidth="8" fill="transparent"
            className="text-secondary"
          />
          <circle
            cx="128" cy="128" r="120"
            stroke="currentColor" strokeWidth="8" fill="transparent"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
            className={phase === "work" ? "text-primary" : "text-green-500"}
          />
        </svg>

        <div className="absolute flex flex-col items-center text-center">
          <div className="text-5xl font-mono font-bold">
            {formatTime(timeLeft)}
          </div>
          <div className="mt-2 text-lg uppercase text-muted-foreground">
            {phase === "work" ? "Focus Time" : "Break Time"} {status === "paused" ? "(Paused)" : ""}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          size="lg"
          className="h-16 w-16 rounded-full p-0 text-foreground"
          onClick={isRunning ? handlePause : handleStart}
          disabled={isFetching || isLoading || startTimer.isPending || pauseTimer.isPending || resetTimer.isPending}
        >
          {isRunning ? (
            <Pause className="h-8 w-8 text-foreground" strokeWidth={2.5} />
          ) : (
            <Play className="h-8 w-8 text-foreground" strokeWidth={2.5} />
          )}
        </Button>

        <Button variant="outline" size="icon" onClick={onOpenSettings}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

