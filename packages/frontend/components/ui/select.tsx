import * as React from "react";
import { cn } from "@/lib/utils";

// This is a simple native select for now. 
// A full custom select would require complex state management or a library like radix-ui/react-select
export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "neu-input flex h-10 w-full items-center justify-between px-3 py-2 text-sm text-foreground bg-[rgba(255,255,255,0.04)] ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };

