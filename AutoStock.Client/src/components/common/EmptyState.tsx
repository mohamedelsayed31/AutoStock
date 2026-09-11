import type {
    LucideIcon,
  } from "lucide-react";
  
  interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    message: string;
    actionText?: string;
    onAction?: () => void;
  }
  
  
  function EmptyState({
    icon: Icon,
    title,
    message,
    actionText,
    onAction,
  }: EmptyStateProps) {
    return (
      <div className="app-empty-state">
  
        <div className="app-empty-icon">
          <Icon size={30} />
        </div>
  
        <h3>
          {title}
        </h3>
  
        <p>
          {message}
        </p>
  
        {actionText && onAction && (
          <button
            type="button"
            className="app-empty-action"
            onClick={onAction}
          >
            {actionText}
          </button>
        )}
  
      </div>
    );
  }
  
  
  export default EmptyState;