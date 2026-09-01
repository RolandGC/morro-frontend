"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

import {
  useToastListener,
  dismissToast,
  Toast,
} from "@/hooks/useToast";

import { cn } from "@/lib/utils";

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = useToastListener(setToasts);

    return unsubscribe;
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const Icon =
          toast.type === "success"
            ? CheckCircle2
            : toast.type === "error"
              ? XCircle
              : toast.type === "warning"
                ? AlertTriangle
                : Info;

        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg",
              "animate-in fade-in slide-in-from-right-4 duration-300",
              {
                "bg-green-500": toast.type === "success",
                "bg-red-500": toast.type === "error",
                "bg-blue-500": toast.type === "info",
                "bg-yellow-500 text-black": toast.type === "warning",
              }
            )}
          >
            {/* Icono según el tipo */}
            <Icon
              size={21}
              className="shrink-0"
            />

            {/* Mensaje */}
            <span className="flex-1">
              {toast.message}
            </span>

            {/* Botón cerrar */}
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 rounded-md p-1 opacity-80 transition hover:bg-black/10 hover:opacity-100"
              aria-label="Cerrar notificación"
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
