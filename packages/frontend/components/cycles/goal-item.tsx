import { Goal } from "@/types/cycle";
import { useGoalProgress, useGoalStats, useToggleProgress } from "@/hooks/use-cycles";
import { ProgressHeatmap } from "./progress-heatmap";
import { WeeklySummary } from "./weekly-summary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface GoalItemProps {
  goal: Goal;
}

export function GoalItem({ goal }: GoalItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: progress, isLoading: isLoadingProgress } = useGoalProgress(goal.id);
  const { data: stats, isLoading: isLoadingStats } = useGoalStats(goal.id);
  const toggleProgress = useToggleProgress();

  const handleToggleDay = (date: string, completed: boolean) => {
    toggleProgress.mutate({ goalId: goal.id, date, completed });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{goal.title}</CardTitle>
            {goal.description && (
              <CardDescription className="mt-1">{goal.description}</CardDescription>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoadingProgress ? (
          <LoadingSpinner size={16} />
        ) : progress ? (
          <div className="flex flex-col items-center sm:items-start gap-4">
            <ProgressHeatmap data={progress} onToggleDay={handleToggleDay} />
            
            {isExpanded && stats && (
               <div className="w-full animate-in slide-in-from-top-2 duration-200">
                 <WeeklySummary stats={stats} />
               </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

