"use client";

import { useState } from "react";
import { Timer } from "@/components/pomodoro/timer";
import { SettingsModal } from "@/components/pomodoro/settings-modal";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePomodoroStats } from "@/hooks/use-pomodoro";

export default function PomodoroPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { data: stats } = usePomodoroStats();

  return (
    <main className="container max-w-4xl mx-auto p-4 md:p-8 space-y-6 flex flex-col items-center min-h-screen">
      <div className="w-full flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Focus Timer</h1>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="bg-card border rounded-xl shadow-sm w-full max-w-md">
           <Timer onOpenSettings={() => setIsSettingsOpen(true)} />
        </div>
        
        {stats && (
          <div className="mt-8 grid grid-cols-2 gap-8 text-center">
             <div>
               <div className="text-2xl font-bold">{stats.total_sessions}</div>
               <div className="text-xs text-muted-foreground uppercase tracking-wider">Sessions</div>
             </div>
             <div>
               <div className="text-2xl font-bold">{stats.total_hours}</div>
               <div className="text-xs text-muted-foreground uppercase tracking-wider">Hours Focused</div>
             </div>
          </div>
        )}
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </main>
  );
}

