import { useState, useEffect } from "react";
import { Plus, History } from "lucide-react";
import { useCycles, useCreateCycle } from "@/hooks/use-cycles";
import { CycleCard } from "./cycle-card";
import { CreateCycleModal } from "./create-cycle-modal";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format } from "date-fns";

export function CycleList() {
  const [showArchived, setShowArchived] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { data: cycles, isLoading } = useCycles(!showArchived);
  const createCycle = useCreateCycle();

  // Auto-fill logic: If activeOnly is true (default), and no cycles found, create one.
  useEffect(() => {
    if (!isLoading && cycles && cycles.length === 0 && !showArchived) {
      // No active cycles. Auto-create one starting today.
      const today = new Date();
      const startDate = format(today, "yyyy-MM-dd");
      
      // Check if we already tried to create (to prevent loop if API fails)
      // Using session storage or ref might be safer, but for now let's just try once
      // Or rely on the user explicitly creating if they deleted everything.
      // But "Autofill ... when page is loaded" implies automation.
      // Let's create it.
      
      // Ideally we check if there really are no cycles at all?
      // Or just no ACTIVE ones? "Autofill 12-week in year" likely implies "Ensure there is a current cycle".
      
      createCycle.mutate({
        name: `Cycle ${format(today, "MMM yyyy")}`,
        start_date: startDate
      });
    }
  }, [isLoading, cycles, showArchived, createCycle]);

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;

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
            {showArchived ? "No cycles found." : "Creating your first cycle..."}
          </p>
          {showArchived && (
             <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
               Start New Cycle
             </Button>
          )}
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
