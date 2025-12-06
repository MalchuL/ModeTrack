"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListTodo, CalendarRange, Timer, Music, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTimerStore } from "@/stores/timer-store";
import { APP_NAME } from "@/lib/constants";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/cycles", label: "12-Week Year", icon: CalendarRange },
  { href: "/pomodoro", label: "Focus Timer", icon: Timer },
  { href: "/music", label: "Music", icon: Music },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { timeLeft, isRunning, phase } = useTimerStore();

  // Simple format for mini timer
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const timeString = `${m}:${s.toString().padStart(2, "0")}`;

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 neu-surface-strong transform transition-transform duration-200 ease-in-out md:translate-x-0 flex flex-col shadow-[var(--shadow-strong)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-transparent">
          <h1 className="text-2xl font-bold tracking-tight">{APP_NAME}</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 neu-surface-soft shadow-[var(--shadow-soft)] hover:-translate-y-0.5",
                  isActive 
                    ? "neu-pressed text-primary-foreground bg-primary/90"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mini Timer Display */}
        <div className="p-4 border-t border-transparent">
          <Link href="/pomodoro">
             <div className="flex items-center justify-between p-3 rounded-xl neu-surface-soft shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-raised)] transition-all cursor-pointer">
               <div className="flex items-center gap-2">
                 <div className={cn("w-2 h-2 rounded-full animate-pulse", isRunning ? "bg-green-500" : "bg-yellow-500")} />
                 <span className="text-xs font-medium uppercase text-muted-foreground">
                   {phase === "work" ? "Focus" : "Break"}
                 </span>
               </div>
               <span className="font-mono font-bold text-lg">{timeString}</span>
             </div>
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

