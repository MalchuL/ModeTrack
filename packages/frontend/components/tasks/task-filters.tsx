import { useState, useEffect } from "react";
import { TaskFilters as ITaskFilters, TaskPriority, TaskStatus } from "@/types/task";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useCreateTask } from "@/hooks/use-tasks";

interface TaskFiltersProps {
  filters: ITaskFilters;
  onFilterChange: (filters: ITaskFilters) => void;
}

export function TaskFilters({ filters, onFilterChange }: TaskFiltersProps) {
  const [inputValue, setInputValue] = useState(filters.search || "");
  const createTask = useCreateTask();

  useEffect(() => {
    setInputValue(filters.search || "");
  }, [filters.search]);

  const handleChange = (key: keyof ITaskFilters, value: string) => {
    onFilterChange({ ...filters, [key]: value || undefined });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    handleChange("search", e.target.value);
  };

  const clearFilters = () => {
    onFilterChange({});
    setInputValue("");
  };

  const hasFilters = Object.values(filters).some(Boolean);

  // Parsing logic
  const parseTaskInput = (input: string) => {
    const tags: string[] = [];
    let priority: TaskPriority = TaskPriority.MEDIUM;
    let cleanTitle = input;

    // Parse Tags (# or №)
    // Allow tags with any non-whitespace characters (incl. unicode), stopping at space
    const tagRegex = /(?:^|\s)(#|№)([^\s#№]+)/gu;
    cleanTitle = cleanTitle.replace(tagRegex, (match, prefix, tag) => {
      tags.push(tag);
      return ""; // Remove tag from title
    });

    // Parse Priority (!1-4 or !number)
    // 1: Low, 2: Medium, 3: High, 4: Urgent
    // Clamping: <=0 -> Low, >=5 -> Urgent
    const priorityRegex = /(?:^|\s)!(-?\d+)/;
    const priorityMatch = cleanTitle.match(priorityRegex);
    if (priorityMatch) {
      const pLevel = parseInt(priorityMatch[1]);
      
      if (pLevel <= 1) priority = TaskPriority.LOW; // <=1 to allow !1 as Low, and !0
      else if (pLevel === 2) priority = TaskPriority.MEDIUM;
      else if (pLevel === 3) priority = TaskPriority.HIGH;
      else if (pLevel >= 4) priority = TaskPriority.URGENT; // >=4 to allow !4 as Urgent, and !5
      
      cleanTitle = cleanTitle.replace(priorityRegex, "");
    }

    return {
      title: cleanTitle.trim().replace(/\s+/g, " "),
      tags,
      priority,
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const { title, tags, priority } = parseTaskInput(inputValue);
      
      if (!title) return; // Don't create empty tasks

      createTask.mutate({
        title,
        tags,
        priority,
        status: TaskStatus.TODO,
      });

      // Clear input after creation
      setInputValue("");
      handleChange("search", "");
    }
  };

  // Highlight preview generation
  const renderHighlighted = (text: string) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.match(/^(#|№)[^\s#№]+/u)) {
        return (
          <span key={i} className="text-blue-500 font-medium">
            {part}
          </span>
        );
      }
      if (part.match(/^!-?\d+/)) {
        return (
          <span key={i} className="text-orange-500 font-bold">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const getHighlightedPreview = () => {
    if (!inputValue) return null;
    return renderHighlighted(inputValue);
  };

  return (
    <div className="space-y-4 mb-6 neu-surface-soft p-4 rounded-2xl shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[200px] relative group">
          <Input
            placeholder="Search tasks or add new (e.g. 'Buy milk #personal !4' + Enter)"
            value={inputValue}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="h-9 pr-16"
          />
          {inputValue && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setInputValue("");
                handleChange("search", "");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
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
      
      {/* Parsing Preview Feedback */}
      {inputValue && (
        <div className="space-y-1 pl-1">
          <div className="text-xs text-muted-foreground h-4 flex gap-1">
             {getHighlightedPreview()}
          </div>
          <div className="text-xs text-muted-foreground">
            Press Enter to create task: {renderHighlighted(inputValue)}
          </div>
        </div>
      )}
    </div>
  );
}
