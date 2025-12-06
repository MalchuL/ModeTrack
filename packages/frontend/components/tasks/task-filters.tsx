import { useState, useEffect } from "react";
import { TaskFilters as ITaskFilters, TaskPriority, TaskStatus } from "@/types/task";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { useCreateTask } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";

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
    const tagRegex = /(?:^|\s)(#|№)([\w-]+)/g;
    cleanTitle = cleanTitle.replace(tagRegex, (match, prefix, tag) => {
      tags.push(tag);
      return ""; // Remove tag from title
    });

    // Parse Priority (@1-4 or *1-4)
    // 1: Low, 2: Medium, 3: High, 4: Urgent
    const priorityRegex = /(?:^|\s)(?:@|\*)(\d)/;
    const priorityMatch = cleanTitle.match(priorityRegex);
    if (priorityMatch) {
      const pLevel = parseInt(priorityMatch[1]);
      switch (pLevel) {
        case 1: priority = TaskPriority.LOW; break;
        case 2: priority = TaskPriority.MEDIUM; break;
        case 3: priority = TaskPriority.HIGH; break;
        case 4: priority = TaskPriority.URGENT; break;
        default: priority = TaskPriority.MEDIUM;
      }
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
  const getHighlightedPreview = () => {
    if (!inputValue) return null;
    
    const parts = inputValue.split(/(\s+)/);
    return parts.map((part, i) => {
      if (part.match(/^(#|№)[\w-]+/)) {
        return <span key={i} className="text-blue-500 font-medium">{part}</span>;
      }
      if (part.match(/^(?:@|\*)\d/)) {
        return <span key={i} className="text-orange-500 font-bold">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[200px] relative group">
          <Input
            placeholder="Search tasks or add new (e.g. 'Buy milk #personal @4' + Enter)"
            value={inputValue}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="h-9 pr-8"
          />
          {/* Highlight Overlay - simplified as visual feedback below input for now to avoid alignment issues */}
          {/* Ideally this would be a contentEditable div replacing Input, but keeping Input for functionality is safer */}
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
        <div className="text-xs text-muted-foreground pl-1 h-4 flex gap-1">
           {getHighlightedPreview()}
        </div>
      )}
    </div>
  );
}
