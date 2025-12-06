import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Cycle, CycleCreate, CycleUpdate, Goal, GoalCreate, HeatmapData, WeeklyStat } from "@/types/cycle";
import { toast } from "@/components/ui/toast";

// Keys
export const cycleKeys = {
  all: ["cycles"] as const,
  lists: () => [...cycleKeys.all, "list"] as const,
  details: () => [...cycleKeys.all, "detail"] as const,
  detail: (id: number) => [...cycleKeys.details(), id] as const,
};

export const goalKeys = {
  all: ["goals"] as const,
  byCycle: (cycleId: number) => [...goalKeys.all, "cycle", cycleId] as const,
  progress: (goalId: number) => [...goalKeys.all, "progress", goalId] as const,
  stats: (goalId: number) => [...goalKeys.all, "stats", goalId] as const,
};

// --- Cycle Hooks ---

const fetchCycles = async (activeOnly = false) => {
  const { data } = await api.get<Cycle[]>("/cycles", {
    params: { active_only: activeOnly },
  });
  return data;
};

const createCycle = async (cycle: CycleCreate) => {
  const { data } = await api.post<Cycle>("/cycles", cycle);
  return data;
};

const archiveCycle = async (id: number) => {
  const { data } = await api.post<Cycle>(`/cycles/${id}/archive`);
  return data;
};

export function useCycles(activeOnly = false) {
  return useQuery({
    queryKey: [...cycleKeys.lists(), { activeOnly }],
    queryFn: () => fetchCycles(activeOnly),
  });
}

export function useCreateCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCycle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleKeys.lists() });
      toast.success("Cycle created");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to create cycle");
    },
  });
}

export function useArchiveCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveCycle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cycleKeys.lists() });
      toast.success("Cycle archived");
    },
  });
}

// --- Goal Hooks ---

const fetchGoals = async (cycleId: number) => {
  const { data } = await api.get<Goal[]>("/goals", {
    params: { cycle_id: cycleId },
  });
  return data;
};

const createGoal = async (goal: GoalCreate) => {
  const { data } = await api.post<Goal>("/goals", goal);
  return data;
};

export function useGoals(cycleId: number) {
  return useQuery({
    queryKey: goalKeys.byCycle(cycleId),
    queryFn: () => fetchGoals(cycleId),
    enabled: !!cycleId,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGoal,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.byCycle(variables.cycle_id) });
      toast.success("Goal created");
    },
  });
}

// --- Progress Hooks ---

const fetchProgress = async (goalId: number) => {
  const { data } = await api.get<HeatmapData[]>(`/goals/${goalId}/progress`);
  return data;
};

const fetchStats = async (goalId: number) => {
  const { data } = await api.get<WeeklyStat[]>(`/goals/${goalId}/stats`);
  return data;
};

const markProgress = async ({ goalId, date }: { goalId: number; date: string }) => {
  await api.post(`/goals/${goalId}/progress`, { date });
};

const unmarkProgress = async ({ goalId, date }: { goalId: number; date: string }) => {
  await api.delete(`/goals/${goalId}/progress/${date}`);
};

export function useGoalProgress(goalId: number) {
  return useQuery({
    queryKey: goalKeys.progress(goalId),
    queryFn: () => fetchProgress(goalId),
    enabled: !!goalId,
  });
}

export function useGoalStats(goalId: number) {
  return useQuery({
    queryKey: goalKeys.stats(goalId),
    queryFn: () => fetchStats(goalId),
    enabled: !!goalId,
  });
}

export function useToggleProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ goalId, date, completed }: { goalId: number; date: string; completed: boolean }) => {
      if (completed) {
        return markProgress({ goalId, date });
      } else {
        return unmarkProgress({ goalId, date });
      }
    },
    onMutate: async ({ goalId, date, completed }) => {
      // Cancel refetches
      await queryClient.cancelQueries({ queryKey: goalKeys.progress(goalId) });
      await queryClient.cancelQueries({ queryKey: goalKeys.stats(goalId) });

      // Optimistic update for heatmap
      const previousProgress = queryClient.getQueryData<HeatmapData[]>(goalKeys.progress(goalId));
      
      if (previousProgress) {
        queryClient.setQueryData<HeatmapData[]>(
          goalKeys.progress(goalId),
          previousProgress.map(p => 
            p.date === date ? { ...p, completed } : p
          )
        );
      }

      return { previousProgress };
    },
    onError: (err, { goalId }, context) => {
      if (context?.previousProgress) {
        queryClient.setQueryData(goalKeys.progress(goalId), context.previousProgress);
      }
      toast.error("Failed to update progress");
    },
    onSettled: (_, __, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.progress(goalId) });
      queryClient.invalidateQueries({ queryKey: goalKeys.stats(goalId) });
    },
  });
}

