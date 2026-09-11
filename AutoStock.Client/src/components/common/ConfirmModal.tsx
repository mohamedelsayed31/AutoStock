import {
    AlertTriangle,
    Archive,
    RotateCcw,
    Trash2,
    X,
  } from "lucide-react";
  
  export type ConfirmModalVariant =
    | "danger"
    | "warning"
    | "restore";
  
  interface ConfirmModalProps {
    open: boolean;
  
    title: string;
  
    message: string;
  
    confirmText?: string;
  
    cancelText?: string;
  
    variant?: ConfirmModalVariant;
  
    loading?: boolean;
  
    onConfirm: () => void;
  
    onCancel: () => void;
  }
  
  
  function ConfirmModal({
    open,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "warning",
    loading = false,
    onConfirm,
    onCancel,
  }: ConfirmModalProps) {
  
    if (!open) {
      return null;
    }
  
  
    const Icon =
      variant === "danger"
        ? Trash2
        : variant === "restore"
          ? RotateCcw
          : AlertTriangle;
  
  
    return (
      <div
        className="confirm-modal-backdrop"
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onCancel();
          }
        }}
      >
  
        <div
          className="confirm-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
  
          <button
            type="button"
            className="confirm-modal-close"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
          >
            <X size={19} />
          </button>
  
  
          <div
            className={`
              confirm-modal-icon
              confirm-modal-icon-${variant}
            `}
          >
            <Icon size={25} />
          </div>
  
  
          <div className="confirm-modal-content">
  
            <h2 id="confirm-modal-title">
              {title}
            </h2>
  
            <p>
              {message}
            </p>
  
          </div>
  
  
          <div className="confirm-modal-actions">
  
            <button
              type="button"
              className="confirm-modal-cancel"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </button>
  
  
            <button
              type="button"
              className={`
                confirm-modal-confirm
                confirm-modal-confirm-${variant}
              `}
              onClick={onConfirm}
              disabled={loading}
            >
  
              {variant === "danger" && (
                <Trash2 size={17} />
              )}
  
              {variant === "restore" && (
                <RotateCcw size={17} />
              )}
  
              {variant === "warning" && (
                <Archive size={17} />
              )}
  
  
              {loading
                ? "Please wait..."
                : confirmText}
  
            </button>
  
          </div>
  
        </div>
  
      </div>
    );
  }
  
  
  export default ConfirmModal;