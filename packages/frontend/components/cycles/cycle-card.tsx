import { format, differenceInDays } from "date-fns";
import { Archive, Calendar, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Cycle } from "@/types/cycle";
import { useArchiveCycle, useDeleteCycle } from "@/hooks/use-cycles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalList } from "./goal-list";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CycleCardProps {
  cycle: Cycle;
  defaultExpanded?: boolean;
}

export function CycleCard({ cycle, defaultExpanded = false }: CycleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const archiveCycle = useArchiveCycle();
  const deleteCycle = useDeleteCycle();

  const startDate = new Date(cycle.start_date);
  const endDate = new Date(cycle.end_date);
  const today = new Date();
  
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const daysElapsed = Math.max(0, Math.min(totalDays, differenceInDays(today, startDate) + 1));
  const progressPercent = Math.min(100, (daysElapsed / totalDays) * 100);
  
  const isActive = !cycle.is_archived && today >= startDate && today <= endDate;

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to archive this cycle?")) {
      archiveCycle.mutate(cycle.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this cycle? This action cannot be undone.")) {
      deleteCycle.mutate(cycle.id);
    }
  };

  return (
    <Card className={cn("transition-all", isActive && "border-primary/50 shadow-md")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center gap-2">
              <CardTitle>{cycle.name || `Cycle ${format(startDate, "MMM yyyy")}`}</CardTitle>
              {isActive && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </span>
              )}
              {cycle.is_archived && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  Archived
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}</span>
              </div>
              <div>
                Week {Math.ceil(daysElapsed / 7)} of {Math.ceil(totalDays / 7)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {!cycle.is_archived ? (
              <Button variant="ghost" size="icon" onClick={handleArchive} title="Archive Cycle">
                <Archive className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={handleDelete} title="Delete Cycle">
                <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mt-2">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="animate-in slide-in-from-top-2 duration-200">
          <div className="pt-2 border-t">
            <GoalList cycleId={cycle.id} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
