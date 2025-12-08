import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PomodoroSettings, PomodoroSettingsUpdate, PomodoroSession, PomodoroSessionCreate, PomodoroStats, PomodoroTimerState, PomodoroPhase } from "@/types/pomodoro";
import { toast } from "@/components/ui/toast";

export const pomodoroKeys = {
  all: ["pomodoro"] as const,
  settings: () => [...pomodoroKeys.all, "settings"] as const,
  sessions: () => [...pomodoroKeys.all, "sessions"] as const,
  stats: () => [...pomodoroKeys.all, "stats"] as const,
  timer: () => [...pomodoroKeys.all, "timer"] as const,
};

const fetchSettings = async () => {
  const { data } = await api.get<PomodoroSettings>("/pomodoro/settings");
  return data;
};

const updateSettings = async (settings: PomodoroSettingsUpdate) => {
  const { data } = await api.put<PomodoroSettings>("/pomodoro/settings", settings);
  return data;
};

const fetchSessions = async (limit = 50) => {
  const { data } = await api.get<PomodoroSession[]>("/pomodoro/sessions", { params: { limit } });
  return data;
};

const logSession = async (session: PomodoroSessionCreate) => {
  const { data } = await api.post<PomodoroSession>("/pomodoro/sessions", session);
  return data;
};

const fetchStats = async () => {
  const { data } = await api.get<PomodoroStats>("/pomodoro/stats");
  return data;
};

const fetchTimer = async () => {
  const { data } = await api.get<PomodoroTimerState>("/pomodoro/timer");
  return data;
};

const startTimer = async (payload: { phase: PomodoroPhase; duration_seconds: number }) => {
  const { data } = await api.post<PomodoroTimerState>("/pomodoro/timer/start", payload);
  return data;
};

const pauseTimerApi = async () => {
  const { data } = await api.post<PomodoroTimerState>("/pomodoro/timer/pause");
  return data;
};

const resetTimerApi = async (payload: { phase: PomodoroPhase; duration_seconds: number }) => {
  const { data } = await api.post<PomodoroTimerState>("/pomodoro/timer/reset", payload);
  return data;
};

const completePhaseApi = async () => {
  const { data } = await api.post<PomodoroTimerState>("/pomodoro/timer/complete");
  return data;
};

export function usePomodoroSettings() {
  return useQuery({
    queryKey: pomodoroKeys.settings(),
    queryFn: fetchSettings,
    // Don't refetch settings too often
    staleTime: Infinity,
  });
}

export function useUpdatePomodoroSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(pomodoroKeys.settings(), data);
      toast.success("Settings saved");
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });
}

export function usePomodoroHistory(limit = 50) {
  return useQuery({
    queryKey: pomodoroKeys.sessions(),
    queryFn: () => fetchSessions(limit),
  });
}

export function useLogPomodoroSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pomodoroKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: pomodoroKeys.stats() });
      // toast.success("Session logged"); // Optional, might be too noisy
    },
  });
}

export function usePomodoroStats() {
  return useQuery({
    queryKey: pomodoroKeys.stats(),
    queryFn: fetchStats,
  });
}

export function usePomodoroTimer() {
  return useQuery({
    queryKey: pomodoroKeys.timer(),
    queryFn: fetchTimer,
    refetchInterval: 1000 * 15, // safety refresh
  });
}

export function useStartPomodoroTimer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startTimer,
    onSuccess: (data) => {
      queryClient.setQueryData(pomodoroKeys.timer(), data);
    },
  });
}

export function usePausePomodoroTimer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pauseTimerApi,
    onSuccess: (data) => {
      queryClient.setQueryData(pomodoroKeys.timer(), data);
    },
  });
}

export function useResetPomodoroTimer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetTimerApi,
    onSuccess: (data) => {
      queryClient.setQueryData(pomodoroKeys.timer(), data);
    },
  });
}

export function useCompletePomodoroPhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completePhaseApi,
    onSuccess: (data) => {
      queryClient.setQueryData(pomodoroKeys.timer(), data);
    },
  });
}

