import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePomodoroSettings, useUpdatePomodoroSettings } from "@/hooks/use-pomodoro";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useEffect } from "react";

const settingsSchema = z.object({
  work_duration_minutes: z.coerce.number().min(1).max(60),
  short_break_minutes: z.coerce.number().min(1).max(30),
  long_break_minutes: z.coerce.number().min(1).max(60),
  long_break_interval: z.coerce.number().min(1).max(10),
  // We'll use simple checkboxes which return booleans
  sound_enabled: z.boolean(),
  auto_start_breaks: z.boolean(),
  auto_start_pomodoros: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data: settings, isLoading } = usePomodoroSettings();
  const updateSettings = useUpdatePomodoroSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as Resolver<SettingsFormValues>,
    defaultValues: {
       work_duration_minutes: 25,
       short_break_minutes: 5,
       long_break_minutes: 15,
       long_break_interval: 4,
       sound_enabled: true,
       auto_start_breaks: false,
       auto_start_pomodoros: false,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        work_duration_minutes: settings.work_duration_minutes,
        short_break_minutes: settings.short_break_minutes,
        long_break_minutes: settings.long_break_minutes,
        long_break_interval: settings.long_break_interval,
        sound_enabled: settings.sound_enabled,
        auto_start_breaks: settings.auto_start_breaks,
        auto_start_pomodoros: settings.auto_start_pomodoros,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      await updateSettings.mutateAsync(data);
      onClose();
    } catch (error) {
      console.error("Failed to update settings", error);
    }
  };

  if (isLoading) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Timer Settings">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Work Duration (min)</label>
            <Input type="number" {...register("work_duration_minutes")} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Short Break (min)</label>
            <Input type="number" {...register("short_break_minutes")} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Long Break (min)</label>
            <Input type="number" {...register("long_break_minutes")} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Long Break Interval</label>
            <Input type="number" {...register("long_break_interval")} />
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="sound" {...register("sound_enabled")} className="h-4 w-4 rounded border-gray-300" />
            <label htmlFor="sound" className="text-sm">Enable Sound</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="auto-break" {...register("auto_start_breaks")} className="h-4 w-4 rounded border-gray-300" />
            <label htmlFor="auto-break" className="text-sm">Auto-start Breaks</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="auto-pomo" {...register("auto_start_pomodoros")} className="h-4 w-4 rounded border-gray-300" />
            <label htmlFor="auto-pomo" className="text-sm">Auto-start Pomodoros</label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Save Settings
          </Button>
        </div>
      </form>
    </Modal>
  );
}

