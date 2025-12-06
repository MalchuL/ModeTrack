import { useState } from "react";
import { Plus, History } from "lucide-react";
import { useCycles } from "@/hooks/use-cycles";
import { CycleCard } from "./cycle-card";
import { CreateCycleModal } from "./create-cycle-modal";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Checkbox } from "@/components/ui/checkbox"; // Need to implement Checkbox or use simple input
// I'll just use a simple button toggle for "Show Archived"

export function CycleList() {
  const [showArchived, setShowArchived] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // We fetch all if showArchived is true, otherwise only active
  // My hook supports activeOnly flag.
  // If showArchived is true, we want ALL (activeOnly=false).
  // If showArchived is false, we want ONLY ACTIVE (activeOnly=true).
  const { data: cycles, isLoading } = useCycles(!showArchived);

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;

  const hasActiveCycle = cycles?.some(c => !c.is_archived);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Cycles</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowArchived(!showArchived)}
            className={showArchived ? "bg-secondary" : ""}
          >
            <History className="h-4 w-4 mr-2" />
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Cycle
        </Button>
      </div>

      {!cycles?.length ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground mb-4">
            {showArchived ? "No cycles found." : "No active cycles."}
          </p>
          <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
            Start your first 12-Week Cycle
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {cycles.map((cycle) => (
            <CycleCard 
              key={cycle.id} 
              cycle={cycle} 
              defaultExpanded={!cycle.is_archived}
            />
          ))}
        </div>
      )}

      <CreateCycleModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
      />
    </div>
  );
}

