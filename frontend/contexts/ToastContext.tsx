'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ToastContainer from '@/components/ui/ToastContainer';
import { ToastType } from '@/components/ui/Toast';

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ShowToastOptions {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ShowToastOptions) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((options: ShowToastOptions) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(7);
    const newToast: ToastData = {
      id,
      type: options.type,
      title: options.title,
      message: options.message,
      duration: options.duration || 5000,
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};
