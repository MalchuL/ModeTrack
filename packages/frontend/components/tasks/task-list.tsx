import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Task, TaskFilters as ITaskFilters, TaskStatus, TaskPriority } from "@/types/task";
import { useTasks, useReorderTasks } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TaskItem } from "./task-item";
import { TaskFilters } from "./task-filters";
import { TaskEditor } from "./task-editor";

export function TaskList() {
  const [filters, setFilters] = useState<ITaskFilters>({});
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const { data: tasks, isLoading, error } = useTasks(filters);
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const reorderTasks = useReorderTasks();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setIsEditorOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingTask(undefined);
    setIsEditorOpen(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditingTask(undefined);
  }, []);

  // Client-side sorting and filtering
  const processedTasks = useMemo(() => {
    if (!tasks) return [];

    // 1. Filter completed by default if no status filter is set
    let filtered = [...tasks];
    if (!filters.status) {
        filtered = filtered.filter(t => t.status !== TaskStatus.COMPLETED);
    }

    // 2. Sort order (aligned with backend):
    // Ordering priority:
    // 1) Due-arrived (overdue/today) first across all tasks
    // 2) Status: In Progress > Todo > Completed
    // 3) Position asc (nulls last)
    // 4) Due-date present before none
    // 5) If due date: due date asc
    // 6) If no due date: created_at desc (newest first)
    // 7) Priority desc
    // 8) created_at asc tie-breaker
    
    const priorityWeight = {
        [TaskPriority.URGENT]: 4,
        [TaskPriority.HIGH]: 3,
        [TaskPriority.MEDIUM]: 2,
        [TaskPriority.LOW]: 1,
    };

    const statusWeight = {
        [TaskStatus.IN_PROGRESS]: 2,
        [TaskStatus.TODO]: 1,
        [TaskStatus.COMPLETED]: 0,
    };

    return filtered.sort((a, b) => {
        const now = Date.now();
        const isDueArrived = (t: Task) => {
            if (!t.due_date) return false;
            const d = new Date(t.due_date);
            d.setHours(0, 0, 0, 0);
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            return d.getTime() <= today.getTime();
        };

        const dueArrivedA = isDueArrived(a) ? 0 : 1;
        const dueArrivedB = isDueArrived(b) ? 0 : 1;
        if (dueArrivedA !== dueArrivedB) return dueArrivedA - dueArrivedB;

        if (statusWeight[a.status] !== statusWeight[b.status]) {
            return statusWeight[b.status] - statusWeight[a.status]; // higher weight first
        }

        const posA = a.position ?? Number.MAX_SAFE_INTEGER;
        const posB = b.position ?? Number.MAX_SAFE_INTEGER;
        const hasPosA = a.position !== null && a.position !== undefined ? 0 : 1;
        const hasPosB = b.position !== null && b.position !== undefined ? 0 : 1;
        if (hasPosA !== hasPosB) return hasPosA - hasPosB;
        if (posA !== posB) return posA - posB;

        const hasDueA = a.due_date ? 0 : 1;
        const hasDueB = b.due_date ? 0 : 1;
        if (hasDueA !== hasDueB) return hasDueA - hasDueB;

        if (a.due_date && b.due_date) {
            const dateA = new Date(a.due_date).getTime();
            const dateB = new Date(b.due_date).getTime();
            if (dateA !== dateB) {
                return dateA - dateB;
            }
        }

        const createdA = new Date(a.created_at).getTime();
        const createdB = new Date(b.created_at).getTime();

        if (!a.due_date && !b.due_date) {
            if (createdA !== createdB) {
                return createdB - createdA; // newest first
            }
        }

        // Priority (Desc)
        const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (priorityDiff !== 0) {
            return priorityDiff;
        }

        return createdA - createdB;
    });

  }, [tasks, filters.status]);

  // Keep local drag order in sync with server data, preserving manual order when possible
  useEffect(() => {
    if (!processedTasks.length) {
      setOrderedIds([]);
      return;
    }
    // Always adopt the freshly sorted order from server-side logic
    setOrderedIds(processedTasks.map((t) => t.id));
  }, [processedTasks]);

  const taskMap = useMemo(
    () => new Map(processedTasks.map((task) => [task.id, task])),
    [processedTasks]
  );

  const orderedTasks =
    orderedIds.length > 0
      ? orderedIds
          .map((id) => taskMap.get(id))
          .filter(Boolean) as Task[]
      : processedTasks;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = taskMap.get(Number(active.id));
    const overTask = taskMap.get(Number(over.id));
    if (!activeTask || !overTask) return;

    if (activeTask.status !== overTask.status) return;

    setOrderedIds((items) => {
      const activeIndex = items.indexOf(Number(active.id));
      const overIndex = items.indexOf(Number(over.id));
      if (activeIndex === -1 || overIndex === -1) return items;
      const next = arrayMove(items, activeIndex, overIndex);

      const statusIds = next.filter((id) => taskMap.get(id)?.status === activeTask.status);
      reorderTasks.mutate({ status: activeTask.status, orderedIds: statusIds });

      return next;
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
        <Button onClick={handleCreate} className="shadow-[var(--shadow-strong)]">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <TaskFilters filters={filters} onFilterChange={setFilters} />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-center text-destructive py-8">
          Error loading tasks. Please try again.
        </div>
      ) : processedTasks.length === 0 ? (
        <div className="text-center py-12 neu-surface-soft rounded-2xl shadow-[var(--shadow-soft)]">
          <p className="text-muted-foreground">No tasks found.</p>
          <Button variant="link" onClick={handleCreate}>
            Create your first task
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-3">
              {orderedTasks.map((task) => (
                <TaskItem key={task.id} task={task} onEdit={handleEdit} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <TaskEditor
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        task={editingTask}
      />
    </div>
  );
}
