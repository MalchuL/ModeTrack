import { useState, useRef, useEffect } from "react";
import { format, isBefore, isToday, startOfDay } from "date-fns";
import { CheckCircle2, Circle, Clock, Tag, Trash2, AlertCircle, Check, X, AlignLeft, Edit3 } from "lucide-react";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { Input } from "@/components/ui/input";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

// Inline Edit Component
function InlineEdit({ 
  initialValue, 
  type = "text", 
  onSave, 
  onCancel,
  className
}: { 
  initialValue: string; 
  type?: "text" | "date" | "select";
  onSave: (val: string) => void; 
  onCancel: () => void;
  className?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (selectRef.current && type === "select") {
        selectRef.current.focus();
    }
  }, [type]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSave(value);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
      if (e.relatedTarget && (e.currentTarget.contains(e.relatedTarget as Node))) {
          return;
      }
      onSave(value);
  };

  return (
    <div 
        className={cn("absolute z-50 bg-background border rounded-md shadow-lg p-1 flex gap-1 items-center", className)} 
        onClick={(e) => e.stopPropagation()}
        onBlur={handleBlur} 
        tabIndex={-1}
    >
      {type === "select" ? (
        <select
            ref={selectRef}
            value={value} 
            onChange={(e) => {
                setValue(e.target.value);
                onSave(e.target.value);
            }}
            className="h-8 w-[120px] text-xs bg-transparent border rounded px-1 focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
        >
            <option value={TaskPriority.LOW}>Low</option>
            <option value={TaskPriority.MEDIUM}>Medium</option>
            <option value={TaskPriority.HIGH}>High</option>
            <option value={TaskPriority.URGENT}>Urgent</option>
        </select>
      ) : (
        <Input 
            ref={inputRef}
            type={type}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-auto min-w-[140px] text-xs"
        />
      )}
      
      {type !== "select" && (
        <Button 
            size="icon" 
            variant="ghost" 
            className="h-6 w-6 hover:text-green-600" 
            onMouseDown={(e) => e.preventDefault()} 
            onClick={() => onSave(value)}
        >
            <Check className="h-3 w-3" />
        </Button>
      )}

      {type === "date" && value && (
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-6 w-6 hover:text-destructive" 
            onMouseDown={(e) => e.preventDefault()} 
            onClick={() => {
                setValue("");
                onSave("");
            }}
          >
              <Trash2 className="h-3 w-3" />
          </Button>
      )}
    </div>
  );
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  
  const [editingField, setEditingField] = useState<"priority" | "date" | "tags" | null>(null);
  const [isUpdated, setIsUpdated] = useState(false);

  const prevUpdatedAt = useRef(task.updated_at);
  
  useEffect(() => {
      if (task.updated_at !== prevUpdatedAt.current) {
          setIsUpdated(true);
          prevUpdatedAt.current = task.updated_at;
          const timer = setTimeout(() => setIsUpdated(false), 1000);
          return () => clearTimeout(timer);
      }
  }, [task.updated_at]);


  const handleToggleStatus = () => {
    const newStatus =
      task.status === TaskStatus.COMPLETED
        ? TaskStatus.TODO
        : TaskStatus.COMPLETED;
    updateTask.mutate({ id: task.id, status: newStatus });
  };
  
  const handleToggleProgress = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === TaskStatus.TODO ? TaskStatus.IN_PROGRESS : TaskStatus.TODO;
    updateTask.mutate({ id: task.id, status: newStatus });
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(task.id);
    }
  };

  const handleContentEdit = (field: "title" | "description", newValue: string) => {
      if (task[field] !== newValue) {
         updateTask.mutate({ id: task.id, [field]: newValue });
      }
  };

  const handleAddDescription = (e: React.MouseEvent) => {
      e.stopPropagation();
      updateTask.mutate({ id: task.id, description: "Description" });
  }

  const priorityColor = {
    [TaskPriority.LOW]: "text-blue-600",
    [TaskPriority.MEDIUM]: "text-yellow-600",
    [TaskPriority.HIGH]: "text-orange-600",
    [TaskPriority.URGENT]: "text-red-600",
  };

  const today = startOfDay(new Date());
  const dueDate = task.due_date ? startOfDay(new Date(task.due_date)) : null;
  const isOverdueOrToday = dueDate && (isBefore(dueDate, today) || isToday(dueDate));
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isInProgress = task.status === TaskStatus.IN_PROGRESS;

  const updatePriority = (val: string) => {
      if (Object.values(TaskPriority).includes(val as TaskPriority)) {
          updateTask.mutate({ id: task.id, priority: val as TaskPriority });
      }
      setEditingField(null);
  }

  const updateDate = (val: string) => {
      updateTask.mutate({ id: task.id, due_date: val || null });
      setEditingField(null);
  }

  const updateTags = (val: string) => {
      const tags = val.split(",").map(t => t.trim()).filter(Boolean);
      updateTask.mutate({ id: task.id, tags });
      setEditingField(null);
  }

  // Badges Components
  const StatusBadge = !isCompleted && (
    <div 
        key="status"
        className={cn(
        "px-2 py-0.5 rounded border shadow-sm font-medium cursor-pointer hover:opacity-80 transition-opacity select-none",
        task.status === TaskStatus.IN_PROGRESS 
            ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
            : "bg-secondary text-muted-foreground border-border"
        )}
        onClick={handleToggleProgress}
    >
        {task.status === TaskStatus.IN_PROGRESS ? "IN PROGRESS" : "TODO"}
    </div>
  );

  const DateBadge = (
    <div key="date" className="relative">
      {editingField === "date" ? (
          <InlineEdit 
              initialValue={task.due_date ? format(new Date(task.due_date), "yyyy-MM-dd") : ""}
              type="date"
              onSave={updateDate}
              onCancel={() => setEditingField(null)}
              className="top-[-40px] left-0"
          />
      ) : (
          <div 
              className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded border bg-white dark:bg-black shadow-sm cursor-pointer hover:border-primary",
              !isCompleted && isOverdueOrToday ? "border-red-200 text-red-600 font-medium" : "border-border text-muted-foreground",
               // If not set, invisible unless group hover
              !task.due_date && "opacity-0 group-hover:opacity-100 transition-opacity"
              )}
              onClick={(e) => { e.stopPropagation(); setEditingField("date"); }}
              title="Click to edit due date"
          >
              <Clock className="h-3 w-3" />
              <span>{task.due_date ? format(new Date(task.due_date), "MMM d") : "Set Date"}</span>
          </div>
      )}
    </div>
  );

  const PriorityBadge = (
    <div key="priority" className="relative">
      {editingField === "priority" ? (
          <InlineEdit 
              initialValue={task.priority}
              type="select"
              onSave={updatePriority}
              onCancel={() => setEditingField(null)}
              className="top-[-40px] left-0"
          />
      ) : (
          <div 
              className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded border bg-white dark:bg-black shadow-sm capitalize cursor-pointer hover:border-primary",
              "border-border",
              priorityColor[task.priority]
              )}
              onClick={(e) => { e.stopPropagation(); setEditingField("priority"); }}
              title="Click to edit priority"
          >
              <AlertCircle className="h-3 w-3" />
              <span>{task.priority}</span>
          </div>
      )}
    </div>
  );

  const TagsBadge = (
    <div key="tags" className="relative flex items-center">
        {editingField === "tags" ? (
        <InlineEdit 
            initialValue={task.tags.join(", ")}
            type="text"
            onSave={updateTags}
            onCancel={() => setEditingField(null)}
            className="top-[-40px] left-0 w-48"
        />
        ) : (
        <div 
            className={cn(
                "flex items-center gap-2 cursor-pointer group/tags transition-opacity",
                // Only show add button if hovering or empty
                task.tags.length === 0 && "opacity-0 group-hover:opacity-100"
            )} 
            onClick={(e) => { e.stopPropagation(); setEditingField("tags"); }}
        >
            {task.tags.length > 0 ? (
                task.tags.map((tag) => (
                    <span
                    key={tag}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-muted-foreground hover:bg-primary/10"
                    >
                    <Tag className="h-3 w-3" />
                    {tag}
                    </span>
                ))
            ) : (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground opacity-50 hover:opacity-100 ml-1">
                    <Tag className="h-3 w-3" /> Add Tags
                </span>
            )}
        </div>
        )}
    </div>
  );

  const DescriptionBadge = !task.description && (
      <div 
        key="description"
        className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-dashed border-muted-foreground/30 bg-transparent text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-secondary hover:border-solid"
        onClick={handleAddDescription}
        title="Add description"
      >
          <AlignLeft className="h-3 w-3" />
          <span>Add Description</span>
      </div>
  );

  const setBadges = [];
  const unsetBadges = [];

  if (StatusBadge) setBadges.push(StatusBadge);
  
  if (task.due_date) setBadges.push(DateBadge);
  else unsetBadges.push(DateBadge);

  setBadges.push(PriorityBadge);

  if (task.tags.length > 0) setBadges.push(TagsBadge);
  else unsetBadges.push(TagsBadge);
  
  if (DescriptionBadge) unsetBadges.push(DescriptionBadge);

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-4 rounded-lg border transition-all relative overflow-visible",
        // Duration reduced to 150ms for faster feedback, or removed for instant
        isUpdated && "duration-0", // Instant on
        !isUpdated && "duration-500", // Slow off
        
        isCompleted 
            ? "opacity-60 bg-muted/50 border-transparent" 
            : (isUpdated 
                ? "bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800" 
                : (isOverdueOrToday 
                    ? "bg-red-300/80 border-red-200 dark:bg-red-900/10 dark:border-red-900/30" 
                    : (isInProgress 
                        ? "bg-[#FDE68A]/80 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/30"
                        : "bg-card hover:shadow-sm"
                      )
                  )
              )
      )}
      onClick={() => onEdit(task)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleToggleStatus();
        }}
        className="mt-1 text-muted-foreground hover:text-primary transition-colors z-10 flex-shrink-0"
      >
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      <div className="flex-1 min-w-0 z-10">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "font-medium leading-none -ml-1 px-1 rounded outline-none focus:bg-background focus:ring-1 focus:ring-ring min-h-[1.25rem] cursor-text w-fit max-w-[calc(100%-6rem)]", 
              isCompleted && "line-through text-muted-foreground"
            )}
            contentEditable={!isCompleted}
            suppressContentEditableWarning
            onBlur={(e) => handleContentEdit("title", e.currentTarget.textContent || "")}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
          >
            {task.title}
          </h3>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-auto">
             <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-primary"
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                }}
                title="Open Full Editor"
            >
                <Edit3 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {task.description && (
            <p
                className={cn(
                    "mt-1 text-sm text-muted-foreground -ml-1 px-1 rounded outline-none focus:bg-background focus:ring-1 focus:ring-ring min-h-[1.25rem] cursor-text w-fit max-w-full",
                )}
                contentEditable={!isCompleted}
                suppressContentEditableWarning
                onBlur={(e) => handleContentEdit("description", e.currentTarget.textContent || "")}
                onClick={(e) => e.stopPropagation()}
            >
                {task.description}
            </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {setBadges}
          {unsetBadges}
        </div>
      </div>
    </div>
  );
}
