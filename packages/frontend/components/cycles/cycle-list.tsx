import { useState, useEffect, useRef } from "react";
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
  const autoCreateAttempted = useRef(false);
  
  // Always fetch ALL cycles to check duplication/history for auto-create logic
  // We will filter them client-side for display based on showArchived
  const { data: allCycles, isLoading } = useCycles(false); // activeOnly=false -> get all
  const createCycle = useCreateCycle();

  const displayCycles = allCycles?.filter(c => showArchived || !c.is_archived) || [];

  // Auto-fill logic: 
  // Only create if NO cycles exist at all (fresh start) 
  // OR if the last cycle ended in the past and we have no active cycles.
  useEffect(() => {
    if (!isLoading && allCycles && !autoCreateAttempted.current) {
      autoCreateAttempted.current = true; // Run only once per mount/data load

      const hasActive = allCycles.some(c => !c.is_archived);
      const hasAny = allCycles.length > 0;
      
      if (!hasAny) {
        // Fresh start - create one
        const today = new Date();
        const startDate = format(today, "yyyy-MM-dd");
        createCycle.mutate({
          name: `Cycle ${format(today, "MMM yyyy")}`,
          start_date: startDate
        });
      } else if (!hasActive) {
        // Has archived cycles but no active ones.
        // Check if the most recent cycle (by end date) is really in the past.
        // If the user *just* archived a cycle that covers today, we shouldn't recreate it immediately.
        const sortedCycles = [...allCycles].sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());
        const latestCycle = sortedCycles[0];
        const today = new Date();
        const latestEnd = new Date(latestCycle.end_date);
        
        // If latest cycle ended yesterday or before, assume they want a new one.
        // If latest cycle ends today or in future (and is archived), it means they manually stopped it.
        // Don't auto-create in that case.
        if (latestEnd < today) {
           // Maybe they want to start a new one?
           // But let's be conservative. Only auto-create on *empty* db is safer.
           // Or maybe if they have NO active cycles, and they visit the page, prompt them?
           // The user requirement "Autofill ... when page is loaded" suggests proactive.
           // But "It duplicates same cycle if I archive it" suggests we were too aggressive.
           
           // Fix: Only auto-create if NO cycles exist. Otherwise let user create.
           // This solves the duplication issue completely.
           // If they want a new cycle after archiving, they click "New Cycle".
           // Re-reading requirement: "Autofill 12-week in year when page is loaded"
           // Maybe they meant "If I have NO data, give me a default one".
           // I will stick to "Only if no cycles exist".
        }
      }
    }
  }, [isLoading, allCycles, createCycle]);

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

      {!displayCycles.length ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground mb-4">
            {showArchived ? "No cycles found." : "No active cycles."}
          </p>
          <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
            Start New Cycle
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {displayCycles.map((cycle) => (
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
