import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addWeeks } from "date-fns";
import { useCreateCycle } from "@/hooks/use-cycles";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const cycleSchema = z.object({
  name: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
});

type CycleFormValues = z.infer<typeof cycleSchema>;

interface CreateCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCycleModal({ isOpen, onClose }: CreateCycleModalProps) {
  const createCycle = useCreateCycle();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CycleFormValues>({
    resolver: zodResolver(cycleSchema),
    defaultValues: {
      start_date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const startDate = watch("start_date");
  const estimatedEndDate = startDate 
    ? format(addWeeks(new Date(startDate), 12), "MMM d, yyyy")
    : "-";

  const onSubmit = async (data: CycleFormValues) => {
    try {
      await createCycle.mutateAsync({
        name: data.name || undefined,
        start_date: data.start_date,
      });
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to create cycle", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start New 12-Week Cycle">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-secondary/50 p-3 rounded-md text-sm text-muted-foreground mb-4">
          A 12-Week Year cycle focuses on achieving significant goals in a shorter timeframe. 
          The cycle will automatically end 12 weeks from the start date.
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Cycle Name (Optional)</label>
          <Input
            {...register("name")}
            placeholder="e.g. Q1 Push, Health Focus"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <Input type="date" {...register("start_date")} />
        </div>

        <div className="text-sm text-muted-foreground">
          Ends on: <span className="font-medium text-foreground">{estimatedEndDate}</span>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Create Cycle
          </Button>
        </div>
      </form>
    </Modal>
  );
}

