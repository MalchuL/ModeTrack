export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null; // ISO string
  position?: number | null;
  tags: string[];
  goal_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: string;
  position?: number | null;
  tags?: string[];
  goal_id?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: string | null; // Allow clearing date
  position?: number | null;
  tags?: string[];
  goal_id?: number | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  goal_id?: number;
  tag?: string;
  search?: string;
}

export interface TaskListResponse {
  items: Task[];
  count: number;
}

