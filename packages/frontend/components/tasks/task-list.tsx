import { useState } from "react";
import { Plus } from "lucide-react";
import { Task, TaskFilters as ITaskFilters } from "@/types/task";
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
      ) : tasks?.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No tasks found.</p>
          <Button variant="link" onClick={handleCreate}>
            Create your first task
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {tasks?.map((task) => (
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

