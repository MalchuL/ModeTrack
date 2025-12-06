import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Task, TaskFilters as ITaskFilters, TaskStatus, TaskPriority } from "@/types/task";
import { useTasks } from "@/hooks/use-tasks";
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

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setEditingTask(undefined);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingTask(undefined);
  };

  // Client-side sorting and filtering
  const processedTasks = useMemo(() => {
    if (!tasks) return [];

    // 1. Filter completed by default if no status filter is set
    let filtered = tasks;
    if (!filters.status) {
        filtered = tasks.filter(t => t.status !== TaskStatus.COMPLETED);
    }

    // 2. Sort order:
    // Group 1: In Progress, Todo (Priority: In Progress > Todo)
    // Group 2: Completed (if shown)
    // Within Groups: Due Date (asc) > Priority (Urgent->Low)
    
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
        // Status Group (In Progress/Todo vs Completed handled by weight)
        // Actually user wants: In progress > Todo > Completed (implied by "After this shows Todo")
        // Wait, prompt says: "In progress, Due Date, Priority. After this shows Todo status, Due Date, Priority"
        // This implies strict grouping by status first.
        
        if (statusWeight[a.status] !== statusWeight[b.status]) {
            return statusWeight[b.status] - statusWeight[a.status]; // Higher weight first
        }

        // Due Date (Ascending, nulls last)
        const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        
        if (dateA !== dateB) {
            return dateA - dateB;
        }

        // Priority (Desc)
        return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

  }, [tasks, filters.status]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
        <Button onClick={handleCreate}>
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
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No tasks found.</p>
          <Button variant="link" onClick={handleCreate}>
            Create your first task
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {processedTasks.map((task) => (
            <TaskItem key={task.id} task={task} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <TaskEditor
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        task={editingTask}
      />
    </div>
  );
}
