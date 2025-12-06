import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 shadow-[var(--shadow-soft)]",
          {
            "bg-gradient-to-br from-[#b39cfb] to-[#9f7aea] text-primary-foreground shadow-[var(--shadow-raised)] hover:brightness-110": variant === "default",
            "bg-gradient-to-br from-[#f87171] to-[#ef4444] text-destructive-foreground shadow-[var(--shadow-strong)] hover:brightness-110": variant === "destructive",
            "neu-surface-soft text-foreground hover:-translate-y-0.5 border border-border": variant === "outline",
            "bg-gradient-to-br from-[rgba(255,255,255,0.14)] to-[rgba(255,255,255,0.08)] text-secondary-foreground shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-raised)] border border-border": variant === "secondary",
            "bg-transparent shadow-none hover:shadow-[var(--shadow-soft)]": variant === "ghost",
            "text-primary underline-offset-4 hover:underline shadow-none": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-xl px-8": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

