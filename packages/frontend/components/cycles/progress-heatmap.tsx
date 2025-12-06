import React from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { HeatmapData } from "@/types/cycle";
import { cn } from "@/lib/utils";

interface ProgressHeatmapProps {
  data: HeatmapData[];
  onToggleDay: (date: string, completed: boolean) => void;
}

export function ProgressHeatmap({ data, onToggleDay }: ProgressHeatmapProps) {
  const today = startOfDay(new Date());

  // Align heatmap so the first day of the cycle sits under its weekday column.
  const firstDate = data[0] ? startOfDay(new Date(data[0].date)) : null;
  const startWeekday = firstDate ? firstDate.getDay() : 1; // 0=Sun ... 6=Sat
  // Map Sunday to end (6) for a Monday-first grid.
  const mondayFirstIndex = ((startWeekday + 6) % 7);
  const leadingPlaceholders = mondayFirstIndex;
  const totalWithLeading = leadingPlaceholders + data.length;
  const trailingPlaceholders = (7 - (totalWithLeading % 7)) % 7;

  const padded: Array<{ key: string; placeholder: true } | { key: string; day: HeatmapData }> = [
    ...Array.from({ length: leadingPlaceholders }).map((_, i) => ({ key: `lead-${i}`, placeholder: true as const })),
    ...data.map((day) => ({ key: day.date, day })),
    ...Array.from({ length: trailingPlaceholders }).map((_, i) => ({ key: `trail-${i}`, placeholder: true as const })),
  ];

  // chunk into weeks for a transposed, compact grid
  const weeks: Array<Array<{ key: string; placeholder: true } | { key: string; day: HeatmapData }>> = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const weekCount = weeks.length;

  return (
    <div
      className="inline-grid gap-1"
      style={{ gridTemplateColumns: `repeat(${weekCount + 1}, minmax(0, 1.6rem))` }}
    >
      {/* Top header: empty corner + week numbers */}
      <div />
      {weeks.map((_, idx) => (
        <div
          key={`week-${idx}`}
          className="text-[10px] text-center text-muted-foreground font-semibold select-none pointer-events-none"
          tabIndex={-1}
          role="presentation"
        >
          {idx + 1}
        </div>
      ))}

      {dayLabels.map((label, dayIndex) => (
        <React.Fragment key={`row-${label}-${dayIndex}`}>
          <div
            className="text-[10px] text-center text-muted-foreground font-medium select-none pointer-events-none"
            tabIndex={-1}
            role="presentation"
          >
            {label}
          </div>
          {weeks.map((week, wIdx) => {
            const entry = week[dayIndex];
            if ("placeholder" in entry && entry.placeholder) {
              return (
                <div
                  key={`${entry.key}-${wIdx}`}
                  className="h-6 w-6 rounded-sm border border-border/30 bg-foreground/5 opacity-40 cursor-not-allowed relative pointer-events-none select-none focus:outline-none focus:ring-0"
                  tabIndex={-1}
                  role="presentation"
                >
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground/70">
                    ⌀
                  </div>
                </div>
              );
            }

            const day = "day" in entry ? entry.day : null;
            if (!day) {
              return (
                <div
                  key={`${entry.key}-${wIdx}`}
                  className="h-6 w-6 rounded-sm border border-border/30 bg-foreground/5 opacity-40 cursor-not-allowed relative pointer-events-none select-none focus:outline-none focus:ring-0"
                  tabIndex={-1}
                  role="presentation"
                />
              );
            }

            const dateObj = startOfDay(new Date(day.date));
            const isToday = dateObj.getTime() === today.getTime();
            const isPast = isBefore(dateObj, today);
            const isFuture = dateObj > today;
            
            return (
              <button
                key={`${entry.key}-${wIdx}`}
                type="button"
                onClick={() => !isFuture && onToggleDay(day.date, !day.completed)}
                disabled={isFuture}
                tabIndex={isFuture ? -1 : 0}
                aria-disabled={isFuture}
                title={`${format(dateObj, "MMM d, yyyy")}: ${day.completed ? "Completed" : "Incomplete"}`}
                className={cn(
                  "h-6 w-6 rounded-sm border transition-all",
                  day.completed && "bg-green-500 border-green-600 hover:bg-green-600",
                  !day.completed && isPast && "bg-red-500 border-red-600 hover:bg-red-600 opacity-70",
                  !day.completed && !isPast && "bg-secondary border-transparent hover:border-border",
                  isToday && "ring-2 ring-ring ring-offset-1",
                  isFuture && "opacity-30 cursor-not-allowed hover:bg-secondary"
                )}
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
