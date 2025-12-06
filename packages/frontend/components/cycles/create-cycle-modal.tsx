import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addWeeks, differenceInWeeks } from "date-fns";
import { useCreateCycle, useCycles } from "@/hooks/use-cycles";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

const cycleSchema = z.object({
  name: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
}).refine((data) => new Date(data.end_date) > new Date(data.start_date), {
  message: "End date must be after start date",
  path: ["end_date"],
});

type CycleFormValues = z.infer<typeof cycleSchema>;

interface CreateCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCycleModal({ isOpen, onClose }: CreateCycleModalProps) {
  const createCycle = useCreateCycle();
  // We need to check existing cycles for overlaps client-side to show the toast
  // We fetch all (active and archived) or just active? 
  // Overlap warning usually relevant for active. 
  const { data: activeCycles } = useCycles(true);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CycleFormValues>({
    resolver: zodResolver(cycleSchema),
    defaultValues: {
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(addWeeks(new Date(), 12), "yyyy-MM-dd"),
    },
  });

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  useEffect(() => {
    if (startDate && !endDate) {
       setValue("end_date", format(addWeeks(new Date(startDate), 12), "yyyy-MM-dd"));
    }
  }, [startDate, endDate, setValue]);

  const durationWeeks = startDate && endDate 
    ? Math.ceil(differenceInWeeks(new Date(endDate), new Date(startDate)))
    : 0;

  const onSubmit = async (data: CycleFormValues) => {
    try {
      // Check for overlap client-side
      if (activeCycles) {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        
        const hasOverlap = activeCycles.some(c => {
          const cStart = new Date(c.start_date);
          const cEnd = new Date(c.end_date);
          return start <= cEnd && end >= cStart;
        });

        if (hasOverlap) {
          toast.warning("Note: This cycle overlaps with an existing active cycle.");
        }
      }

      await createCycle.mutateAsync({
        name: data.name || undefined,
        start_date: data.start_date,
        end_date: data.end_date,
      });
      
      reset();
      onClose();
    } catch (error: any) {
      console.error("Failed to create cycle", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start New Cycle">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-secondary/50 p-3 rounded-md text-sm text-muted-foreground mb-4">
          Create a new goal cycle. Default is 12 weeks, but you can adjust it.
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Cycle Name (Optional)</label>
          <Input
            {...register("name")}
            placeholder="e.g. Q1 Push, Health Focus"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Input type="date" {...register("start_date")} />
            {errors.start_date && <p className="text-xs text-destructive">{errors.start_date.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Input type="date" {...register("end_date")} />
            {errors.end_date && <p className="text-xs text-destructive">{errors.end_date.message}</p>}
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Duration: <span className="font-medium text-foreground">{durationWeeks} weeks</span>
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
