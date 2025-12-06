export interface Cycle {
  id: number;
  name?: string;
  start_date: string;
  end_date: string;
  is_archived: boolean;
}

export interface CycleCreate {
  name?: string;
  start_date: string;
  end_date?: string;
}

export interface CycleUpdate {
  name?: string;
  is_archived?: boolean;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  cycle_id: number;
}

export interface GoalCreate {
  title: string;
  description?: string;
  cycle_id: number;
}

export interface ProgressResponse {
  goal_id: number;
  date: string;
  completed: boolean;
}

export interface WeeklyStat {
  week: number;
  start_date: string;
  end_date: string;
  total_days: number;
  completed_days: number;
  percentage: number;
}

export interface HeatmapData {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

