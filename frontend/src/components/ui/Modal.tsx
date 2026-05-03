import { Fragment, ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md'
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-ink-950/40 backdrop-blur-sm transition-opacity animate-fade-in"
          onClick={onClose}
        />

        {/* Modal Panel */}
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-card p-6 text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidthClasses[maxWidth]} animate-scale-in`}
          style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-ink-900 leading-6">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-ink-400 hover:bg-surface-100 hover:text-ink-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
