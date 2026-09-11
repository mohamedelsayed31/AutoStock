import {
    LoaderCircle,
  } from "lucide-react";
  
  
  interface LoadingSpinnerProps {
    message?: string;
  }
  
  
  function LoadingSpinner({
    message = "Loading...",
  }: LoadingSpinnerProps) {
  
    return (
      <div className="loading-state">
  
        <LoaderCircle
          className="loading-spinner"
          size={34}
        />
  
  
        <p>
          {message}
        </p>
  
      </div>
    );
  }
  
  
  export default LoadingSpinner;