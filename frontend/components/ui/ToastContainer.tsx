'use client';

import Toast, { ToastProps } from './Toast';

interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[];
  onClose: (id: string) => void;
}

const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
