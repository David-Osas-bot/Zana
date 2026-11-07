import { X } from 'lucide-react';

type ConfirmModalProps = {
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: () => void;
  onClose: () => void;
  isPending?: boolean;
};

export function ConfirmModal({
  title,
  description,
  confirmText = 'Delete',
  onConfirm,
  onClose,
  isPending,
}: ConfirmModalProps) {
  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" style={{ maxWidth: 420 }}>
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            <p className="modal-subtitle">{description}</p>
          </div>
          <button className="icon-button" onClick={onClose} data-testid="button-close-confirm">
            <X size={17} />
          </button>
        </div>
        <div className="modal-actions" style={{ marginTop: 24 }}>
          <button className="button secondary" onClick={onClose} data-testid="button-cancel-confirm">
            Cancel
          </button>
          <button
            className="button"
            disabled={isPending}
            onClick={onConfirm}
            style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
            data-testid="button-action-confirm"
          >
            {isPending ? 'Deleting…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
