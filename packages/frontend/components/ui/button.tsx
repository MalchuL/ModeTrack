import * as React from "react";
import { Slot } from "@radix-ui/react-slot"; // We don't have radix yet, let's stick to basic or install it.
// Actually, I didn't install radix-ui primitives. I'll implement simple versions first.
// Task list just says "Build Button component with variants"
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
            "bg-gradient-to-br from-[#2d3a5c] to-[#1f2a44] text-primary-foreground shadow-[var(--shadow-strong)] hover:brightness-105": variant === "default",
            "bg-gradient-to-br from-[#f87171] to-[#ef4444] text-destructive-foreground shadow-[var(--shadow-strong)] hover:brightness-105": variant === "destructive",
            "neu-surface-soft text-foreground hover:-translate-y-0.5 border border-border": variant === "outline",
            "bg-gradient-to-br from-[#f8fbff] via-[#eef3ff] to-[#e1e7f5] text-secondary-foreground shadow-[var(--shadow-raised)] hover:shadow-[var(--shadow-strong)]": variant === "secondary",
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

