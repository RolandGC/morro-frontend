import { useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Simple in-memory store for toasts
const listeners: Set<(toasts: Toast[]) => void> = new Set();
let toasts: Toast[] = [];
let toastId = 0;

export const useToast = () => {
  const notify = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = `toast-${toastId++}`;
    const toast: Toast = { id, message, type, duration };
    
    toasts = [...toasts, toast];
    listeners.forEach(listener => listener(toasts));

    if (duration > 0) {
      setTimeout(() => {
        toasts = toasts.filter(t => t.id !== id);
        listeners.forEach(listener => listener(toasts));
      }, duration);
    }

    return id;
  }, []);

  const success = useCallback((message: string, duration?: number) => 
    notify(message, 'success', duration), [notify]);
  
  const error = useCallback((message: string, duration?: number) => 
    notify(message, 'error', duration), [notify]);
  
  const info = useCallback((message: string, duration?: number) => 
    notify(message, 'info', duration), [notify]);

  return { notify, success, error, info };
};

export const useToastListener = (callback: (toasts: Toast[]) => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

/** función global para mostrar toasts desde fuera de componentes React */
export function showToast(message: string, type: ToastType = 'info', duration = 3000) {
  const id = `toast-${toastId++}`;
  const toast: Toast = { id, message, type, duration };
  toasts = [...toasts, toast];
  listeners.forEach(listener => listener(toasts));
  if (duration > 0) {
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      listeners.forEach(listener => listener(toasts));
    }, duration);
  }
  return id;
}
