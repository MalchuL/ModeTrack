import { format } from "date-fns";
import { CheckCircle2, Circle, Clock, Tag, Trash2, AlertCircle } from "lucide-react";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleToggleStatus = () => {
    const newStatus =
      task.status === TaskStatus.COMPLETED
        ? TaskStatus.TODO
        : TaskStatus.COMPLETED;
    updateTask.mutate({ id: task.id, status: newStatus });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(task.id);
    }
  };

  const priorityColor = {
    [TaskPriority.LOW]: "text-blue-500",
    [TaskPriority.MEDIUM]: "text-yellow-500",
    [TaskPriority.HIGH]: "text-orange-500",
    [TaskPriority.URGENT]: "text-red-500",
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-4 rounded-lg border bg-card hover:shadow-sm transition-all cursor-pointer",
        task.status === TaskStatus.COMPLETED && "opacity-60 bg-muted/50"
      )}
      onClick={() => onEdit(task)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleToggleStatus();
        }}
        className="mt-1 text-muted-foreground hover:text-primary transition-colors"
      >
        {task.status === TaskStatus.COMPLETED ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "font-medium leading-none truncate",
              task.status === TaskStatus.COMPLETED && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {task.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {task.due_date && (
            <div className={cn("flex items-center gap-1", 
              new Date(task.due_date) < new Date() && task.status !== TaskStatus.COMPLETED && "text-destructive"
            )}>
              <Clock className="h-3 w-3" />
              <span>{format(new Date(task.due_date), "MMM d")}</span>
            </div>
          )}

          <div className={cn("flex items-center gap-1 capitalize", priorityColor[task.priority])}>
            <AlertCircle className="h-3 w-3" />
            <span>{task.priority}</span>
          </div>

          {task.tags.length > 0 && (
            <div className="flex items-center gap-2">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

