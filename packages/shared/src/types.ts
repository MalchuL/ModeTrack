// Task types
export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  tags: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  goalId?: number;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in-progress' | 'done';
  tags?: string[];
  dueDate?: string;
  goalId?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in-progress' | 'done';
  tags?: string[];
  dueDate?: string;
  goalId?: number;
}

// Cycle and Goal types
export interface Cycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isArchived: boolean;
  createdAt: string;
  goals?: Goal[];
}

export interface CycleCreate {
  name: string;
  startDate: string;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  cycleId: number;
  createdAt: string;
  tasks?: Task[];
  progress?: Progress[];
}

export interface GoalCreate {
  title: string;
  description?: string;
  cycleId: number;
}

export interface Progress {
  id: number;
  goalId: number;
  completionDate: string;
  createdAt: string;
}

// Pomodoro types
export interface PomodoroState {
  phase: 'work' | 'break' | 'idle';
  remainingSeconds: number;
  isRunning: boolean;
  sessionCount: number;
}

export interface PomodoroSettings {
  id?: number;
  workDurationMinutes: number;
  breakDurationMinutes: number;
  soundEnabled: boolean;
  updatedAt?: string;
}

export interface PomodoroSession {
  id: number;
  workDuration: number;
  breakDuration: number;
  startedAt: string;
  completedAt?: string;
  completed: boolean;
}

export interface PomodoroSessionCreate {
  workDuration: number;
  breakDuration: number;
  startedAt: string;
  completedAt?: string;
  completed: boolean;
}

// Music types
export interface Playlist {
  id: number;
  name: string;
  context: 'work' | 'break';
  createdAt: string;
  tracks?: AudioTrack[];
}

export interface PlaylistCreate {
  name: string;
  context: 'work' | 'break';
}

export interface AudioTrack {
  id: number;
  filePath: string;
  title: string;
  playlistId: number;
  position: number;
  createdAt: string;
}

export interface AudioTrackCreate {
  filePath: string;
  title: string;
  playlistId: number;
  position: number;
}
