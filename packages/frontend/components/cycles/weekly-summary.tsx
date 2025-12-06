import { WeeklyStat } from "@/types/cycle";

interface WeeklySummaryProps {
  stats: WeeklyStat[];
}

export function WeeklySummary({ stats }: WeeklySummaryProps) {
  return (
    <div className="space-y-2 mt-4">
      <h4 className="text-sm font-medium">Weekly Progress</h4>
      <div className="space-y-2">
        {stats.map((week) => (
          <div key={week.week} className="flex items-center gap-2 text-xs">
            <span className="w-8 font-medium text-muted-foreground">W{week.week}</span>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${week.percentage}%` }}
              />
            </div>
            <span className="w-12 text-right tabular-nums text-muted-foreground">
              {Math.round(week.percentage)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

