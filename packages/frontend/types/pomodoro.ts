export interface PomodoroSession {
  id: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  completed: boolean;
}

export interface PomodoroSessionCreate {
  start_time: string;
  end_time: string;
  duration_minutes: number;
  completed: boolean;
}

export interface PomodoroSettings {
  id: number;
  work_duration_minutes: number;
  short_break_minutes: number;
  long_break_minutes: number;
  long_break_interval: number;
  sound_enabled: boolean;
  auto_start_breaks: boolean;
  auto_start_pomodoros: boolean;
}

export interface PomodoroSettingsUpdate {
  work_duration_minutes?: number;
  short_break_minutes?: number;
  long_break_minutes?: number;
  long_break_interval?: number;
  sound_enabled?: boolean;
  auto_start_breaks?: boolean;
  auto_start_pomodoros?: boolean;
}

export interface PomodoroStats {
  total_sessions: number;
  total_minutes: number;
  daily_average: number;
  total_hours: number;
}

export type PomodoroPhase = "work" | "break";

export interface PomodoroTimerState {
  phase: PomodoroPhase;
  is_running: boolean;
  remaining_seconds: number;
  ends_at: string | null;
  updated_at: string;
}

