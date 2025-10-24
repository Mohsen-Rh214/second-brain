import React from 'react';
import { XIcon } from '../shared/icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm' }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="bg-surface/90 backdrop-blur-xl w-full max-w-md border border-outline rounded-2xl shadow-lg animate-pop-in"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-outline-dark">
          <h2 id="confirm-modal-title" className="text-xl font-bold font-heading">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-text-secondary hover:text-text-primary">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <div className="p-6">
          <p className="text-text-secondary whitespace-pre-wrap">{message}</p>
        </div>

        <footer className="p-4 bg-black/5 border-t border-outline-dark flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium bg-destructive hover:bg-destructive-hover text-destructive-content transition-colors rounded-lg"
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default React.memo(ConfirmModal);
