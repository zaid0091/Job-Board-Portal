import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface UnsavedChangesModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function UnsavedChangesModal({ open, onConfirm, onCancel }: UnsavedChangesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl p-6 sm:p-8 max-w-sm w-full animate-scale-in"
           style={{ boxShadow: 'var(--card-shadow-lg)' }}>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-ink-900">Unsaved changes</h3>
            <p className="text-sm text-ink-500 leading-relaxed">
              You have unsaved changes that will be lost if you leave this page.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2 w-full">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg border border-surface-300 text-sm font-medium text-ink-700 hover:bg-surface-100 transition-colors"
            >
              Stay
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
