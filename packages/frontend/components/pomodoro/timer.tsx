import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<"work" | "break">("work");

  // Simple local ticking
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer finished - switch phases
          setIsRunning(false);
          setPhase((current) => current === "work" ? "break" : "work");
          return current === "work" ? 5 * 60 : 25 * 60; // 5 min break, 25 min work
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(phase === "work" ? 25 * 60 : 5 * 60);
  };

  const progress = phase === "work"
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

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
            {phase === "work" ? "Focus Time" : "Break Time"}
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

