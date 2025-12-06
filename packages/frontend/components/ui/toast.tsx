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
  action?: React.ReactNode;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
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
    return id;
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
            "pointer-events-auto flex items-center justify-between rounded-xl neu-surface-soft border border-transparent p-4 shadow-[var(--shadow-raised)] transition-all animate-in slide-in-from-right",
            {
              "ring-1 ring-border text-foreground": toast.type === "info",
              "ring-1 ring-green-200/80 text-green-800 dark:ring-green-900 dark:text-green-200":
                toast.type === "success",
              "ring-1 ring-red-200/80 text-red-800 dark:ring-red-900 dark:text-red-200":
                toast.type === "error",
              "ring-1 ring-yellow-200/80 text-yellow-800 dark:ring-yellow-900 dark:text-yellow-200":
                toast.type === "warning",
            }
          )}
        >
          <div className="flex items-center gap-2 flex-1">
            <p className="text-sm font-medium">{toast.message}</p>
            {toast.action && (
                <div className="ml-2">
                    {toast.action}
                </div>
            )}
          </div>
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

export interface ToastActionProps {
  altText: string;
  onClick: () => void;
  children: React.ReactNode;
}

export function ToastAction({ altText, onClick, children }: ToastActionProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-transparent px-3 text-xs font-medium transition-all hover:shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
      title={altText}
    >
      {children}
    </button>
  );
}

export const toast = {
  success: (message: string, duration?: number, action?: React.ReactNode) =>
    useToastStore.getState().addToast({ message, type: "success", duration, action }),
  error: (message: string, duration?: number, action?: React.ReactNode) =>
    useToastStore.getState().addToast({ message, type: "error", duration, action }),
  info: (message: string, duration?: number, action?: React.ReactNode) =>
    useToastStore.getState().addToast({ message, type: "info", duration, action }),
  warning: (message: string, duration?: number, action?: React.ReactNode) =>
    useToastStore.getState().addToast({ message, type: "warning", duration, action }),
  remove: (id: string) => useToastStore.getState().removeToast(id),
};

