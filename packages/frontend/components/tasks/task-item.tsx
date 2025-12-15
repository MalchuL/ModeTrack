import { memo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { format, isBefore, isToday, startOfDay } from "date-fns";
import { CheckCircle2, Circle, Clock, Tag, Trash2, AlertCircle, Check, X, AlignLeft, Edit3, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { Input } from "@/components/ui/input";
import { toast, ToastAction } from "@/components/ui/toast";

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
  className,
  anchorRect,
}: { 
  initialValue: string; 
  type?: "text" | "date" | "select";
  onSave: (val: string) => void; 
  onCancel: () => void;
  className?: string;
  anchorRect?: DOMRect | null;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [floatingStyle, setFloatingStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (type !== "select" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [type]);

  // Close select picker on outside click
  useEffect(() => {
    if (type !== "select") return;
    if (anchorRect) {
      setFloatingStyle({
        position: "fixed",
        top: anchorRect.bottom + 6,
        left: anchorRect.left,
        zIndex: 999999,
      });
    }
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [type, anchorRect, onCancel]);

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

  const content = (
    <div
      data-dnd-block
      ref={containerRef}
      className={cn(
        type === "select" ? "fixed" : "absolute",
        "neu-surface-soft p-1 flex gap-1 items-center shadow-[var(--shadow-soft)]",
        className
      )}
      style={type === "select" ? floatingStyle : undefined}
      onClick={(e) => e.stopPropagation()}
      onBlur={handleBlur}
      tabIndex={-1}
    >
      {type === "select" ? (
        <div className="flex flex-col gap-1">
          {[
            { label: "Low", value: TaskPriority.LOW, color: "bg-[#d9f99d]" },
            { label: "Med", value: TaskPriority.MEDIUM, color: "bg-[#fef08a]" },
            { label: "High", value: TaskPriority.HIGH, color: "bg-[#fdba74]" },
            { label: "Urgent", value: TaskPriority.URGENT, color: "bg-[#fca5a5]" },
          ].map((opt) => (
            <button
              key={opt.value}
              className={cn(
                "px-3 py-1 rounded-md text-[11px] font-semibold border text-black transition-colors",
                opt.color,
                value === opt.value ? "ring-2 ring-primary/70 border-transparent" : "border-border"
              )}
              onClick={() => {
                setValue(opt.value);
                onSave(opt.value);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
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

  if (type === "select") {
    return createPortal(content, document.body);
  }

  return content;
}

const ANIMATION_DURATION = 700;

export const TaskItem = memo(function TaskItem({ task, onEdit }: TaskItemProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  
  const [editingField, setEditingField] = useState<"priority" | "date" | "tags" | null>(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const draggedRef = useRef(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    transition: {
      duration: 150,
      easing: "ease",
    },
  });

  useEffect(() => {
    if (isDragging) {
      draggedRef.current = true;
    } else if (draggedRef.current) {
      // Reset shortly after drag ends to allow click suppression
      const t = setTimeout(() => {
        draggedRef.current = false;
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isDragging]);

  const coercedTransform =
    transform && typeof transform === "object"
      ? { ...transform, scaleX: 1, scaleY: 1 }
      : transform;

  const dragStyle = {
    transform: CSS.Transform.toString(coercedTransform),
    transition: isDragging ? "transform 0s" : transition,
    willChange: isDragging ? "transform" : undefined,
  };

  const shouldBlockDrag = (target: EventTarget | null) => {
    const el = target as HTMLElement | null;
    if (!el) return false;
    return Boolean(
      el.closest(
        'input, select, textarea, button, [data-dnd-block]'
      )
    );
  };

  const dragListeners = {
    ...listeners,
    onPointerDown: (event: React.PointerEvent) => {
      if (shouldBlockDrag(event.target)) {
        return;
      }
      listeners?.onPointerDown?.(event);
    },
  };

  const prevUpdatedAt = useRef(task.updated_at);
  
  useEffect(() => {
      if (task.updated_at !== prevUpdatedAt.current) {
          setIsUpdated(true);
          prevUpdatedAt.current = task.updated_at;
          const timer = setTimeout(() => setIsUpdated(false), ANIMATION_DURATION);
          return () => clearTimeout(timer);
      }
  }, [task.updated_at]);


  const handleToggleStatus = () => {
    const isCompleting = task.status !== TaskStatus.COMPLETED;
    const newStatus = isCompleting ? TaskStatus.COMPLETED : TaskStatus.TODO;

    // Show toast immediately for clear feedback; still run mutation as usual.
    let toastId: string | undefined;
    if (isCompleting) {
      toastId = toast.success(
        `Task "${task.title}" completed`,
        10000,
        <ToastAction
          altText="Undo"
          onClick={() => {
            updateTask.mutate({ id: task.id, status: TaskStatus.TODO });
            if (toastId) {
              toast.remove(toastId);
            }
          }}
        >
          Undo
        </ToastAction>
      );
    }

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
    [TaskPriority.LOW]: "text-[var(--priority-low)]",
    [TaskPriority.MEDIUM]: "text-[var(--priority-medium)]",
    [TaskPriority.HIGH]: "text-[var(--priority-high)]",
    [TaskPriority.URGENT]: "text-[var(--priority-urgent)]",
  };

  const priorityAnchorRef = useRef<HTMLDivElement>(null);

  const today = startOfDay(new Date());
  const dueDate = task.due_date ? startOfDay(new Date(task.due_date)) : null;
  const isOverdueOrToday = dueDate && (isBefore(dueDate, today) || isToday(dueDate));
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isInProgress = task.status === TaskStatus.IN_PROGRESS;

  const surfaceClass = !isCompleted
    ? isOverdueOrToday
      ? "task-surface-overdue"
      : isInProgress
        ? "task-surface-progress"
        : ""
    : "";

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
        "px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-all select-none neu-surface-soft badge-dark shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-raised)] border border-transparent",
        task.status === TaskStatus.IN_PROGRESS 
            ? "bg-[rgba(183,161,255,0.18)] text-[#c8b7ff] border-[rgba(183,161,255,0.35)]"
            : "text-muted-foreground"
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
              "flex items-center gap-1 px-3 py-1 rounded-full neu-surface-soft badge-dark shadow-[var(--shadow-soft)] cursor-pointer hover:shadow-[var(--shadow-raised)] text-xs",
              !isCompleted && isOverdueOrToday ? "ring-1 ring-red-300 text-[var(--badge-overdue-text)] font-semibold dark:ring-red-500/50 text-outline-strong" : "text-muted-foreground",
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
    <div key="priority" className="relative" ref={priorityAnchorRef}>
      {editingField === "priority" ? (
          <InlineEdit 
              initialValue={task.priority}
              type="select"
              onSave={updatePriority}
              onCancel={() => setEditingField(null)}
              className=""
              anchorRect={priorityAnchorRef.current?.getBoundingClientRect?.()}
          />
      ) : (
          <div 
              className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full neu-surface-soft badge-dark shadow-[var(--shadow-soft)] capitalize cursor-pointer hover:shadow-[var(--shadow-raised)] text-xs font-semibold text-outline-strong",
              priorityColor[task.priority]
              )}
              onClick={(e) => { 
                e.stopPropagation(); 
                setEditingField("priority"); 
              }}
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
                    className="flex items-center gap-1 px-2 py-1 rounded-full neu-surface-soft badge-dark text-muted-foreground shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-raised)]"
                    >
                    <Tag className="h-3 w-3" />
                    {tag}
                    </span>
                ))
            ) : (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full neu-surface-soft badge-dark text-muted-foreground opacity-60 hover:opacity-100 shadow-[var(--shadow-soft)] ml-1">
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
        className="flex items-center gap-1 px-2 py-1 rounded-full border border-dashed border-muted-foreground/30 bg-transparent text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer neu-surface-soft badge-dark hover:shadow-[var(--shadow-raised)]"
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
      ref={setNodeRef}
      style={dragStyle}
      {...attributes}
      {...dragListeners}
      className={cn(
        "group flex items-start gap-3 p-4 rounded-2xl neu-surface transition-all relative overflow-visible cursor-grab active:cursor-grabbing shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-raised)] hover:-translate-y-0.5 task-updated-container",
        surfaceClass,
        "task-updated-overlay task-updated-ring",
        isUpdated && "is-updated ring-2 ring-[rgba(167,139,250,0.35)]",
        isDragging && "shadow-[var(--shadow-strong)] ring-2 ring-[rgba(31,42,68,0.45)] scale-[1.01] cursor-grabbing",
        isCompleted && "opacity-70 saturate-75",
        !isCompleted && isOverdueOrToday && "ring-2 ring-[rgba(239,68,68,0.38)] dark:ring-[rgba(248,113,113,0.55)]",
        !isCompleted && !isOverdueOrToday && isInProgress && "ring-2 ring-[rgba(96,165,250,0.38)] dark:ring-[rgba(96,165,250,0.55)]"
      )}
      onClick={() => {
        if (isDragging || draggedRef.current) return;
        onEdit(task);
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mt-1 text-muted-foreground transition-colors z-10 flex-shrink-0 select-none"
        aria-hidden="true"
      >
        <GripVertical className="h-4 w-4 opacity-40" />
      </div>
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
});
