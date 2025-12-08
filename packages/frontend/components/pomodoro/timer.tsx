import { useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import { useTimerStore, TimerPhase } from "@/stores/timer-store";
import { usePomodoroSettings, useLogPomodoroSession } from "@/hooks/use-pomodoro";
import { Button } from "@/components/ui/button";
import { playNotificationSound } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
  const {
    phase,
    timeLeft,
    isRunning,
    setPhase,
    setTimeLeft,
    startTimer,
    pauseTimer,
    resetTimer,
    incrementCompleted,
    completedPomodoros,
  } = useTimerStore();

  const { data: settings } = usePomodoroSettings();
  const logSession = useLogPomodoroSession();

  // Use refs to track start time for logging
  const startTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Defaults
  const workDuration = (settings?.work_duration_minutes || 25) * 60;
  const shortBreakDuration = (settings?.short_break_minutes || 5) * 60;
  const longBreakDuration = (settings?.long_break_minutes || 15) * 60;
  const longBreakInterval = settings?.long_break_interval || 4;

  // Initialize or update duration when settings load/change AND not running
  useEffect(() => {
    if (!isRunning) {
      if (phase === "work" && timeLeft !== workDuration && timeLeft === 25 * 60) {
          // Only update if default or matching old default? 
          // Actually, if settings change, we might want to reset?
          // For simpler UX, we update if the user hasn't started (timeLeft == full duration of something)
          // But matching "full duration of something" is tricky if we don't know what it was.
          // Let's just ensure if we are at "initial" state, we sync.
          resetTimer(workDuration);
      }
    }
  }, [settings, phase, isRunning, resetTimer, workDuration]);

  // Timer Logic
  useEffect(() => {
    if (isRunning) {
      if (!startTimeRef.current) {
        startTimeRef.current = new Date();
      }

      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, setTimeLeft]);

  // Completion Logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleCompletion();
    }
  }, [timeLeft]);

  const handleCompletion = () => {
    pauseTimer();
    if (settings?.sound_enabled) {
      playNotificationSound();
    }

    const now = new Date();
    const startTime = startTimeRef.current || new Date(now.getTime() - getPhaseDuration(phase) * 1000); // fallback
    
    if (phase === "work") {
      // Log session
      logSession.mutate({
        start_time: startTime.toISOString(),
        end_time: now.toISOString(),
        duration_minutes: settings?.work_duration_minutes || 25,
        completed: true,
      });
      
      incrementCompleted();
      
      // Determine next phase
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
      // Break finished
      setPhase("work", workDuration);
      if (settings?.auto_start_pomodoros) {
        startTimer();
      }
    }
    
    startTimeRef.current = null;
  };

  const getPhaseDuration = (p: TimerPhase) => {
    switch (p) {
      case "work": return workDuration;
      case "shortBreak": return shortBreakDuration;
      case "longBreak": return longBreakDuration;
    }
  };

  const currentTotalDuration = getPhaseDuration(phase);
  const progress = ((currentTotalDuration - timeLeft) / currentTotalDuration) * 100;

  const handleToggle = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const handleReset = () => {
    pauseTimer();
    resetTimer(getPhaseDuration(phase));
    startTimeRef.current = null;
  };

  const handleSkip = () => {
     // Manual skip
     handleCompletion();
  };
  
  // Document title update
  useEffect(() => {
    document.title = `${formatTime(timeLeft)} - ${phase === "work" ? "Work" : "Break"}`;
    return () => {
      document.title = "Productivity App";
    }
  }, [timeLeft, phase]);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8">
      {/* Timer Display */}
      <div className="relative flex items-center justify-center">
        {/* Circular Progress SVG */}
        <svg className="w-64 h-64 transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-secondary"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
            className={cn(
              "transition-all duration-1000 ease-linear",
              phase === "work" ? "text-primary" : "text-green-500"
            )}
          />
        </svg>
        
        <div className="absolute flex flex-col items-center text-center">
          <div className="text-5xl font-mono font-bold tracking-tighter">
            {formatTime(timeLeft)}
          </div>
          <div className="mt-2 text-lg font-medium uppercase tracking-widest text-muted-foreground">
            {phase === "work" ? "Focus" : phase === "shortBreak" ? "Short Break" : "Long Break"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          disabled={isRunning && timeLeft === currentTotalDuration}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          size="lg"
          className="h-16 w-16 rounded-full"
          onClick={handleToggle}
        >
          {isRunning ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
        </Button>

        <Button variant="outline" size="icon" onClick={onOpenSettings}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-2">
         <div className="text-sm text-muted-foreground">
            Session: {completedPomodoros % longBreakInterval} / {longBreakInterval}
         </div>
      </div>
    </div>
  );
}

