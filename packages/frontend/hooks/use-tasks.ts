import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Task, TaskCreate, TaskUpdate, TaskFilters, TaskStatus, TaskListResponse } from "@/types/task";
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
const TASK_PAGE_SIZE = 100;

const buildTaskParams = (filters: TaskFilters | undefined, skip: number) => {
  const params: Record<string, string | number> = {
    skip,
    limit: TASK_PAGE_SIZE,
  };

  if (filters?.status) params.status = filters.status;
  if (filters?.priority) params.priority = filters.priority;
  if (filters?.goal_id !== undefined) params.goal_id = filters.goal_id;
  if (filters?.tag) params.tag = filters.tag;
  if (filters?.search) params.search = filters.search;

  return params;
};

const fetchTasks = async (filters?: TaskFilters): Promise<TaskListResponse> => {
  const aggregated: Task[] = [];
  let total = 0;
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const params = buildTaskParams(filters, skip);
    const { data } = await api.get<TaskListResponse>("/tasks", { params });

    aggregated.push(...data.items);
    total = data.count;
    skip = aggregated.length;

    const receivedFullPage = data.items.length === TASK_PAGE_SIZE;
    hasMore = aggregated.length < total && receivedFullPage;

    if (!receivedFullPage || data.items.length === 0) {
      break;
    }
  }

  return { items: aggregated, count: total };
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

const reorderTasks = async (status: TaskStatus, orderedIds: number[]) => {
  const { data } = await api.put<Task[]>(`/tasks/reorder`, {
    status,
    ordered_ids: orderedIds,
  });
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
      const previousTasks = queryClient.getQueryData<TaskListResponse>(taskKeys.list({}));

      // Optimistically update to the new value
      if (previousTasks) {
        queryClient.setQueryData<TaskListResponse>(
          taskKeys.list({}),
          {
            ...previousTasks,
            items: previousTasks.items.map((task) =>
              task.id === newTask.id ? { ...task, ...newTask } : task
            ),
          }
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

export function useReorderTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ status, orderedIds }: { status: TaskStatus; orderedIds: number[] }) =>
      reorderTasks(status, orderedIds),
    onMutate: async ({ status, orderedIds }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      const previousTasks =
        queryClient.getQueryData<TaskListResponse>(taskKeys.list({})) || {
          items: [],
          count: 0,
        };

      // Optimistically update only tasks in this status
      const reordered = [...previousTasks.items];
      const statusTasks = orderedIds
        .map((id) => reordered.find((t) => t.id === id && t.status === status))
        .filter(Boolean) as Task[];

      const otherStatus = reordered.filter((t) => t.status !== status);
      const remaining = reordered.filter(
        (t) => t.status === status && !orderedIds.includes(t.id)
      );

      const newStatusOrder = [...statusTasks, ...remaining].map((t, idx) => ({
        ...t,
        position: idx + 1,
      }));

      queryClient.setQueryData<TaskListResponse>(taskKeys.list({}), {
        ...previousTasks,
        items: [...otherStatus, ...newStatusOrder],
      });

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.list({}), context.previousTasks);
      }
      toast.error("Failed to reorder tasks");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

