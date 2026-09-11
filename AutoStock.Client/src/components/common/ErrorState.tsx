import {
    AlertCircle,
    RefreshCw,
  } from "lucide-react";
  
  interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
  }
  
  
  function ErrorState({
    title = "Something went wrong",
    message,
    onRetry,
  }: ErrorStateProps) {
    return (
      <div className="app-error-state">
  
        <div className="app-error-icon">
          <AlertCircle size={29} />
        </div>
  
        <h3>
          {title}
        </h3>
  
        <p>
          {message}
        </p>
  
        {onRetry && (
          <button
            type="button"
            className="app-error-retry"
            onClick={onRetry}
          >
            <RefreshCw size={16} />
  
            Try Again
          </button>
        )}
  
      </div>
    );
  }
  
  
  export default ErrorState;