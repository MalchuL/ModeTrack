import { TaskFilters as ITaskFilters, TaskPriority, TaskStatus } from "@/types/task";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TaskFiltersProps {
  filters: ITaskFilters;
  onFilterChange: (filters: ITaskFilters) => void;
}

export function TaskFilters({ filters, onFilterChange }: TaskFiltersProps) {
  const handleChange = (key: keyof ITaskFilters, value: string) => {
    onFilterChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Search tasks..."
          value={filters.search || ""}
          onChange={(e) => handleChange("search", e.target.value)}
          className="h-9"
        />
      </div>
      
      <Select
        value={filters.status || ""}
        onChange={(e) => handleChange("status", e.target.value)}
        className="w-[130px] h-9"
      >
        <option value="">All Status</option>
        <option value={TaskStatus.TODO}>Todo</option>
        <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
        <option value={TaskStatus.COMPLETED}>Completed</option>
      </Select>

      <Select
        value={filters.priority || ""}
        onChange={(e) => handleChange("priority", e.target.value)}
        className="w-[130px] h-9"
      >
        <option value="">All Priorities</option>
        <option value={TaskPriority.LOW}>Low</option>
        <option value={TaskPriority.MEDIUM}>Medium</option>
        <option value={TaskPriority.HIGH}>High</option>
        <option value={TaskPriority.URGENT}>Urgent</option>
      </Select>

      {hasFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="h-9 px-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

