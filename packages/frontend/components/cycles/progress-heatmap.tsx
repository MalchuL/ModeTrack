import { format } from "date-fns";
import { HeatmapData } from "@/types/cycle";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// We need to add Tooltip component to UI library first, or implement simple one here.
// For now, I'll use the native title attribute or implement a simple tooltip.
// Actually, I'll implement a simple css-based tooltip or just use title for MVP to save time/context.

interface ProgressHeatmapProps {
  data: HeatmapData[];
  onToggleDay: (date: string, completed: boolean) => void;
}

export function ProgressHeatmap({ data, onToggleDay }: ProgressHeatmapProps) {
  // Data is expected to be 84 days (12 weeks * 7 days)
  // We render it as a grid: 12 rows (weeks), 7 columns (days)
  
  return (
    <div className="grid grid-cols-7 gap-1 w-fit">
      {/* Day headers */}
      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
        <div key={i} className="text-[10px] text-center text-muted-foreground font-medium">
          {d}
        </div>
      ))}
      
      {data.map((day) => {
        const dateObj = new Date(day.date);
        const isToday = format(new Date(), "yyyy-MM-dd") === day.date;
        const isFuture = dateObj > new Date();
        
        return (
          <button
            key={day.date}
            onClick={() => !isFuture && onToggleDay(day.date, !day.completed)}
            disabled={isFuture}
            title={`${format(dateObj, "MMM d, yyyy")}: ${day.completed ? "Completed" : "Incomplete"}`}
            className={cn(
              "h-6 w-6 rounded-sm border transition-all",
              day.completed 
                ? "bg-green-500 border-green-600 hover:bg-green-600" 
                : "bg-secondary border-transparent hover:border-border",
              isToday && "ring-2 ring-ring ring-offset-1",
              isFuture && "opacity-30 cursor-not-allowed"
            )}
          />
        );
      })}
    </div>
  );
}

