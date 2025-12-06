import { addDays, differenceInCalendarDays, format, startOfDay, subDays } from "date-fns";
import { TaskCreate, TaskPriority, TaskStatus } from "@/types/task";
import { Cycle, CycleCreate, Goal, GoalCreate } from "@/types/cycle";

type CreateCycleFn = (cycle: CycleCreate) => Promise<Cycle>;
type CreateGoalFn = (goal: GoalCreate) => Promise<Goal>;
type CreateTaskFn = (task: TaskCreate) => Promise<unknown>;
type ToggleProgressFn = (options: { goalId: number; date: string; completed: boolean }) => Promise<unknown>;

export interface SampleDataDependencies {
  createCycle: CreateCycleFn;
  createGoal: CreateGoalFn;
  createTask: CreateTaskFn;
  toggleProgress: ToggleProgressFn;
}

/**
 * Generate a sample cycle, goal, and tasks for first-time users.
 */
export async function generateSampleData({
  createCycle,
  createGoal,
  createTask,
  toggleProgress,
}: SampleDataDependencies) {
  const today = startOfDay(new Date());
  const cycleStart = subDays(today, 21); // three weeks back to show history
  const cycleEnd = addDays(cycleStart, 83); // 12 weeks duration

  const cycle = await createCycle({
    name: "ModeTrack Sample Cycle",
    start_date: format(cycleStart, "yyyy-MM-dd"),
    end_date: format(cycleEnd, "yyyy-MM-dd"),
  });

  const goal = await createGoal({
    title: "Kickstart Productivity",
    description: "Sample goal to explore ModeTrack",
    cycle_id: cycle.id,
  });

  const sampleTasks: Array<TaskCreate & { priority: TaskPriority; status: TaskStatus; tags: string[] }> = [
    { title: "Plan the week", priority: TaskPriority.MEDIUM, status: TaskStatus.TODO, tags: ["planning"] },
    { title: "Deep work block", priority: TaskPriority.HIGH, status: TaskStatus.IN_PROGRESS, tags: ["focus"] },
    { title: "Ship a small feature", priority: TaskPriority.URGENT, status: TaskStatus.TODO, tags: ["dev"] },
    { title: "Inbox zero", priority: TaskPriority.LOW, status: TaskStatus.TODO, tags: ["ops"] },
    { title: "Reflect & journal", priority: TaskPriority.MEDIUM, status: TaskStatus.TODO, tags: ["reflect"] },
  ];

  await Promise.all(
    sampleTasks.map((task, idx) =>
      createTask({
        ...task,
        position: idx + 1,
        goal_id: goal.id,
      })
    )
  );

  // Randomly mark past days as completed for the goal
  const maxDaysBack = Math.max(1, differenceInCalendarDays(today, cycleStart));
  const pastDaysCount = Math.min(Math.max(5, Math.floor(Math.random() * 8) + 5), maxDaysBack);

  const used = new Set<number>();
  while (used.size < pastDaysCount) {
    const offset = Math.floor(Math.random() * maxDaysBack) + 1;
    used.add(offset);
  }

  for (const offset of Array.from(used)) {
    const date = addDays(cycleStart, offset);
    if (date > today) continue;
    await toggleProgress({
      goalId: goal.id,
      date: format(date, "yyyy-MM-dd"),
      completed: true,
    });
  }
}
