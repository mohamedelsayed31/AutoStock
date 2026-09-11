import {
    ArrowLeft,
    Home,
    SearchX,
  } from "lucide-react";
  
  import {
    useNavigate,
  } from "react-router-dom";
  
  
  function NotFoundPage() {
    const navigate =
      useNavigate();
  
  
    return (
      <div className="not-found-page">
  
        <div className="not-found-card">
  
          <SearchX
            size={64}
          />
  
  
          <span className="not-found-code">
            404
          </span>
  
  
          <h1>
            Page Not Found
          </h1>
  
  
          <p>
            The page you are looking for
            does not exist or may have
            been moved.
          </p>
  
  
          <div className="not-found-actions">
  
            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
            >
              <ArrowLeft
                size={17}
              />
  
              Go Back
            </button>
  
  
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate(
                  "/dashboard"
                )
              }
            >
              <Home
                size={17}
              />
  
              Dashboard
            </button>
  
          </div>
  
        </div>
  
      </div>
    );
  }
  
  
  export default NotFoundPage;