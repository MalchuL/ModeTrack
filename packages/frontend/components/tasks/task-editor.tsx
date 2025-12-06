import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import { Task, TaskCreate, TaskPriority, TaskStatus } from "@/types/task";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useCycles, useGoals } from "@/hooks/use-cycles";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus),
  due_date: z.string().optional().or(z.literal("")),
  tags: z.string().optional(), // We'll handle comma-separated tags
  goal_id: z.coerce.number().optional().nullable(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskEditorProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
}

export function TaskEditor({ isOpen, onClose, task }: TaskEditorProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  
  // Fetch active cycle to get goals
  const { data: activeCycles } = useCycles(true);
  const activeCycle = activeCycles?.[0]; // Use first active cycle
  
  // Only fetch goals if we have a cycle and editor is open (perf)
  const { data: goals } = useGoals(activeCycle?.id || 0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema) as Resolver<TaskFormValues>,
    defaultValues: {
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
    },
  });

  const dueDate = watch("due_date");

  useEffect(() => {
    if (isOpen) {
      if (task) {
        reset({
          title: task.title,
          description: task.description || "",
          priority: task.priority,
          status: task.status,
          due_date: task.due_date ? task.due_date.split("T")[0] : "",
          tags: task.tags.join(", "),
          goal_id: task.goal_id,
        });
      } else {
        reset({
          title: "",
          description: "",
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.TODO,
          due_date: "",
          tags: "",
          goal_id: null,
        });
      }
    }
  }, [isOpen, task, reset]);

  const onSubmit = async (data: TaskFormValues) => {
    const tags = data.tags
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const payload = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      due_date: data.due_date || null,
      tags,
      goal_id: data.goal_id || null,
    };

    try {
      if (task) {
        await updateTask.mutateAsync({ id: task.id, ...payload });
      } else {
        // For create, null or undefined is fine, but let's respect the type if possible
        // We can just cast payload to unknown then TaskCreate if needed, or relying on structural compatibility
        await createTask.mutateAsync(payload as any);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save task", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? "Edit Task" : "Create Task"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            {...register("title")}
            placeholder="Task title"
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            {...register("description")}
            className="neu-input flex min-h-[80px] w-full px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Details..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select {...register("priority")}>
              <option value={TaskPriority.LOW}>Low</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.HIGH}>High</option>
              <option value={TaskPriority.URGENT}>Urgent</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select {...register("status")}>
              <option value={TaskStatus.TODO}>Todo</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.COMPLETED}>Completed</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <div className="flex gap-2">
              <Input type="date" {...register("due_date")} />
              {dueDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setValue("due_date", "", { shouldValidate: true, shouldDirty: true })}
                  title="Clear Date"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Goal</label>
            <Select {...register("goal_id")}>
              <option value="">No Goal</option>
              {goals?.map((goal) => (
                 <option key={goal.id} value={goal.id}>{goal.title}</option>
              ))}
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <Input
            {...register("tags")}
            placeholder="Comma separated (e.g. work, study)"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {task ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
