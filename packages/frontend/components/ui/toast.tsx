"use client";

import * as React from "react";
import { create } from "zustand";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    if (toast.duration !== Infinity) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toast.duration || 3000);
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-center justify-between rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right",
            {
              "bg-background border-border text-foreground": toast.type === "info",
              "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900 dark:text-green-200":
                toast.type === "success",
              "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900 dark:text-red-200":
                toast.type === "error",
              "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900 dark:text-yellow-200":
                toast.type === "warning",
            }
          )}
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ message, type: "success", duration }),
  error: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ message, type: "error", duration }),
  info: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ message, type: "info", duration }),
  warning: (message: string, duration?: number) =>
    useToastStore.getState().addToast({ message, type: "warning", duration }),
};

