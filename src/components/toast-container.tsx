"use client";

import { useEffect, useState } from "react";
import { useToastListener, Toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = useToastListener(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "px-4 py-3 rounded-md text-white text-sm font-medium animate-in fade-in slide-in-from-right-4 duration-300",
            {
              "bg-green-500": toast.type === "success",
              "bg-red-500": toast.type === "error",
              "bg-blue-500": toast.type === "info",
              "bg-yellow-500": toast.type === "warning",
            }
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
