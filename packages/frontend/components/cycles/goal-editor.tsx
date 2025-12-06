import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateGoal } from "@/hooks/use-cycles";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type GoalFormValues = z.infer<typeof goalSchema>;

interface GoalEditorProps {
  isOpen: boolean;
  onClose: () => void;
  cycleId: number;
}

export function GoalEditor({ isOpen, onClose, cycleId }: GoalEditorProps) {
  const createGoal = useCreateGoal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
  });

  const onSubmit = async (data: GoalFormValues) => {
    try {
      await createGoal.mutateAsync({
        ...data,
        cycle_id: cycleId,
      });
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to create goal", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Goal">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            {...register("title")}
            placeholder="e.g. Lose 10lbs, Ship MVP"
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
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Details about this goal..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Create Goal
          </Button>
        </div>
      </form>
    </Modal>
  );
}

