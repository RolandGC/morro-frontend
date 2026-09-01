import { useCallback } from "react";

export type ToastType =
  | "success"
  | "error"
  | "info"
  | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

const listeners: Set<(toasts: Toast[]) => void> =
  new Set();

let toasts: Toast[] = [];
let toastId = 0;

const removeToast = (id: string) => {
  toasts = toasts.filter((toast) => toast.id !== id);

  listeners.forEach((listener) => listener(toasts));
};


const createToast = (
  message: string,
  type: ToastType = "info",
  duration = 3000
) => {
  const id = `toast-${toastId++}`;

  const toast: Toast = {
    id,
    message,
    type,
    duration,
  };

  toasts = [...toasts, toast];

  listeners.forEach((listener) => listener(toasts));

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
};

export const useToast = () => {
  const notify = useCallback(
    (
      message: string,
      type: ToastType = "info",
      duration = 3000
    ) => {
      return createToast(message, type, duration);
    },
    []
  );

  const success = useCallback(
    (message: string, duration?: number) =>
      notify(message, "success", duration),
    [notify]
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      notify(message, "error", duration),
    [notify]
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      notify(message, "info", duration),
    [notify]
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      notify(message, "warning", duration),
    [notify]
  );

  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, []);

  return {
    notify,
    success,
    error,
    info,
    warning,
    dismiss,
  };
};

export const useToastListener = (
  callback: (toasts: Toast[]) => void
) => {
  listeners.add(callback);

  return () => {
    listeners.delete(callback);
  };
};

/**
 * Función global para mostrar toasts
 * desde fuera de componentes React.
 */
export function showToast(
  message: string,
  type: ToastType = "info",
  duration = 3000
) {
  return createToast(message, type, duration);
}

/**
 * Elimina un toast manualmente.
 */
export function dismissToast(id: string) {
  removeToast(id);
}
