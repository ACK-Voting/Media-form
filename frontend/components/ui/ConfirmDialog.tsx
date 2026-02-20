'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'success';
  showReasonInput?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  isLoading?: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  showReasonInput = false,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Enter reason (optional)',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const [reason, setReason] = useState('');

  // Reset reason when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setReason('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(showReasonInput ? reason : undefined);
  };

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger';
      case 'success':
        return 'success';
      default:
        return 'primary';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="" size="sm">
      <div className="text-center">
        {getIcon()}
        <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        {showReasonInput && (
          <div className="mt-4 text-left">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              {reasonLabel}
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
        )}

        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={getConfirmButtonVariant()} onClick={handleConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
