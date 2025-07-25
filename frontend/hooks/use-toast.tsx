/**
 * Toast Hook for AutoBlogger Pro
 * Provides toast notification functionality using React context
 */

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toastWithId = { ...newToast, id };

    setToasts(prev => [...prev, toastWithId]);

    // Auto dismiss after duration
    const duration = newToast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  };

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
