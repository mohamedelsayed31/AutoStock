import {
    useState,
  } from "react";
  
  import type {
    FormEvent,
  } from "react";
  
  import {
    Link,
    useLocation,
    useNavigate,
  } from "react-router-dom";
  
  import {
    BarChart3,
    CarFront,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
  } from "lucide-react";
  
  import {
    login,
  } from "../../services/authService";
  
  import {
    useAuth,
  } from "../../context/AuthContext";
  
  import {
    getApiErrorMessage,
  } from "../../utils/apiError";
  
  import autoStockLogo
    from "../../assets/images/autostock-logo.png";
  
  
  function LoginPage() {
    const navigate =
      useNavigate();
  
    const location =
      useLocation();
  
    const {
      signIn,
    } = useAuth();
  
  
    const [email, setEmail] =
      useState("");
  
    const [password, setPassword] =
      useState("");
  
    const [
      showPassword,
      setShowPassword,
    ] = useState(false);
  
    const [error, setError] =
      useState("");
  
    const [loading, setLoading] =
      useState(false);
  
  
    const registered =
      location.state?.registered === true;
  
  
    const handleSubmit = async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();
  
      setError("");
      setLoading(true);
  
      try {
        const result =
          await login({
            email: email.trim(),
            password,
          });
  
        signIn(result);
  
        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );
      }
      catch (error) {
        setError(
          getApiErrorMessage(
            error,
            "Invalid email or password."
          )
        );
      }
      finally {
        setLoading(false);
      }
    };
  
  
    return (
      <div className="auth-cinematic-page">
  
        <div className="auth-background" />
  
        <div className="auth-background-overlay" />
  
  
        <section className="auth-marketing">
  
          <div className="auth-marketing-badge">
  
            <img
              src={autoStockLogo}
              alt="AutoStock"
            />
  
          </div>
  
  
          <h1>
            Drive inventory
            <br />
  
            with confidence
            <span>.</span>
          </h1>
  
  
          <p className="auth-marketing-description">
            Secure access to your inventory system.
            Manage vehicles, track stock, and keep
            your business moving forward.
          </p>
  
  
          <div className="auth-features">
  
            <div className="auth-feature">
  
              <CarFront
                size={23}
              />
  
              <div>
                <strong>
                  MANAGE
                </strong>
  
                <span>
                  INVENTORY
                </span>
              </div>
  
            </div>
  
  
            <div className="auth-feature">
  
              <BarChart3
                size={23}
              />
  
              <div>
                <strong>
                  TRACK
                </strong>
  
                <span>
                  PERFORMANCE
                </span>
              </div>
  
            </div>
  
  
            <div className="auth-feature">
  
              <ShieldCheck
                size={23}
              />
  
              <div>
                <strong>
                  SECURE
                </strong>
  
                <span>
                  ACCESS
                </span>
              </div>
  
            </div>
  
          </div>
  
        </section>
  
  
        <section className="auth-glass-card">
  
          <div className="auth-card-brand">
  
            <img
              src={autoStockLogo}
              alt="AutoStock"
            />
  
            <span>
              CAR INVENTORY MANAGEMENT SYSTEM
            </span>
  
          </div>
  
  
          <div className="auth-card-heading">
  
            <h2>
              Login
            </h2>
  
            <p>
              Please enter your details
              to continue.
            </p>
  
          </div>
  
  
          {registered && (
            <div className="auth-success-message">
              Account created successfully.
              You can now login.
            </div>
          )}
  
  
          <form
            className="auth-dark-form"
            onSubmit={handleSubmit}
          >
  
            <div className="auth-dark-group">
  
              <label htmlFor="email">
                Email
              </label>
  
  
              <div className="auth-input-wrapper">
  
                <Mail
                  size={19}
                />
  
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  autoComplete="email"
                  required
                />
  
              </div>
  
            </div>
  
  
            <div className="auth-dark-group">
  
              <label htmlFor="password">
                Password
              </label>
  
  
              <div className="auth-input-wrapper">
  
                <LockKeyhole
                  size={19}
                />
  
                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                  required
                />
  
  
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      size={19}
                    />
                  ) : (
                    <Eye
                      size={19}
                    />
                  )}
                </button>
  
              </div>
  
            </div>
  
  
            {error && (
              <div className="auth-error-message">
                {error}
              </div>
            )}
  
  
            <button
              type="submit"
              className="auth-orange-button"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Login"}
            </button>
  
          </form>
  
  
          <div className="auth-card-divider" />
  
  
          <p className="auth-bottom-link">
  
            Don't have an account?{" "}
  
            <Link to="/register">
              Register
            </Link>
  
          </p>
  
        </section>
  
  
        <div className="auth-footer-left">
          <span />
  
          DRIVEN BY DATA.
          POWERED BY PEOPLE.
        </div>
  
  
        <div className="auth-footer-right">
          AUTOSTOCK
        </div>
  
      </div>
    );
  }
  
  
  export default LoginPage;