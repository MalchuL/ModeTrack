import { format, isBefore, startOfDay } from "date-fns";
import { HeatmapData } from "@/types/cycle";
import { cn } from "@/lib/utils";

interface ProgressHeatmapProps {
  data: HeatmapData[];
  onToggleDay: (date: string, completed: boolean) => void;
}

export function ProgressHeatmap({ data, onToggleDay }: ProgressHeatmapProps) {
  const today = startOfDay(new Date());

  return (
    <div className="grid grid-cols-7 gap-1 w-fit">
      {/* Day headers */}
      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
        <div key={i} className="text-[10px] text-center text-muted-foreground font-medium">
          {d}
        </div>
      ))}
      
      {data.map((day) => {
        const dateObj = startOfDay(new Date(day.date));
        const isToday = dateObj.getTime() === today.getTime();
        const isPast = isBefore(dateObj, today);
        const isFuture = dateObj > today;
        
        return (
          <button
            key={day.date}
            onClick={() => !isFuture && onToggleDay(day.date, !day.completed)}
            disabled={isFuture}
            title={`${format(dateObj, "MMM d, yyyy")}: ${day.completed ? "Completed" : "Incomplete"}`}
            className={cn(
              "h-6 w-6 rounded-sm border transition-all",
              // Completed: Green
              day.completed && "bg-green-500 border-green-600 hover:bg-green-600",
              // Not completed AND In Past: Red (Missed)
              !day.completed && isPast && "bg-red-500 border-red-600 hover:bg-red-600 opacity-70",
              // Not completed AND (Today OR Future): Default Grey
              !day.completed && !isPast && "bg-secondary border-transparent hover:border-border",
              
              isToday && "ring-2 ring-ring ring-offset-1",
              isFuture && "opacity-30 cursor-not-allowed hover:bg-secondary"
            )}
          />
        );
      })}
    </div>
  );
}
