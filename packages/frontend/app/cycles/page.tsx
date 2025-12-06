"use client";

import { CycleList } from "@/components/cycles/cycle-list";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CyclesPage() {
  return (
    <main className="container max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">12-Week Year</h1>
      </div>
      
      <CycleList />
    </main>
  );
}

