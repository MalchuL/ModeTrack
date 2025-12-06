import { useState } from "react";
import { Plus } from "lucide-react";
import { useGoals } from "@/hooks/use-cycles";
import { GoalItem } from "./goal-item";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { GoalEditor } from "./goal-editor";

interface GoalListProps {
  cycleId: number;
}

export function GoalList({ cycleId }: GoalListProps) {
  const { data: goals, isLoading } = useGoals(cycleId);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Goals</h3>
        <Button size="sm" variant="outline" onClick={() => setIsEditorOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {!goals?.length ? (
        <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground">
           No goals yet. Set your first goal for this cycle!
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <GoalItem key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <GoalEditor 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        cycleId={cycleId} 
      />
    </div>
  );
}

