import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Task, TaskCreate, TaskUpdate, TaskFilters } from "@/types/task";
import { toast } from "@/components/ui/toast";

// Keys
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), { filters }] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: number) => [...taskKeys.details(), id] as const,
};

// API functions
const fetchTasks = async (filters?: TaskFilters) => {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.priority) params.append("priority", filters.priority);
  if (filters?.goal_id) params.append("goal_id", filters.goal_id.toString());
  if (filters?.tag) params.append("tag", filters.tag);
  
  const { data } = await api.get<Task[]>("/tasks", { params });
  return data;
};

const fetchTask = async (id: number) => {
  const { data } = await api.get<Task>(`/tasks/${id}`);
  return data;
};

const createTask = async (task: TaskCreate) => {
  const { data } = await api.post<Task>("/tasks", task);
  return data;
};

const updateTask = async ({ id, ...task }: TaskUpdate & { id: number }) => {
  const { data } = await api.put<Task>(`/tasks/${id}`, task);
  return data;
};

const deleteTask = async (id: number) => {
  const { data } = await api.delete<boolean>(`/tasks/${id}`);
  return data;
};

// Hooks
export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(filters || {}),
    queryFn: () => fetchTasks(filters),
  });
}

export function useTask(id: number) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => fetchTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success("Task created successfully");
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.list({}));

      // Optimistically update to the new value
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          taskKeys.list({}),
          previousTasks.map((task) =>
            task.id === newTask.id ? { ...task, ...newTask } : task
          )
        );
      }
      
      // Also update individual task cache
      const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(newTask.id));
      if (previousTask) {
         queryClient.setQueryData<Task>(
          taskKeys.detail(newTask.id),
          { ...previousTask, ...newTask }
        );
      }

      return { previousTasks, previousTask };
    },
    onError: (err, newTask, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list({}), context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(newTask.id), context.previousTask);
      }
      toast.error("Failed to update task");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      toast.success("Task deleted");
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });
}

