import {
    useState,
  } from "react";
  
  import type {
    FormEvent,
  } from "react";
  
  import {
    Link,
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
    User,
  } from "lucide-react";
  
  import {
    register,
  } from "../../services/authService";
  
  import {
    getApiErrorMessage,
  } from "../../utils/apiError";
  
  import autoStockLogo
    from "../../assets/images/autostock-logo.png";
  
  
  function RegisterPage() {
    const navigate =
      useNavigate();
  
  
    const [fullName, setFullName] =
      useState("");
  
    const [email, setEmail] =
      useState("");
  
    const [password, setPassword] =
      useState("");
  
    const [
      confirmPassword,
      setConfirmPassword,
    ] = useState("");
  
    const [
      showPassword,
      setShowPassword,
    ] = useState(false);
  
    const [
      showConfirmPassword,
      setShowConfirmPassword,
    ] = useState(false);
  
    const [loading, setLoading] =
      useState(false);
  
    const [error, setError] =
      useState("");
  
  
    const handleSubmit = async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();
  
      setError("");
  
  
      if (!fullName.trim()) {
        setError(
          "Full name is required."
        );
  
        return;
      }
  
  
      if (password.length < 6) {
        setError(
          "Password must be at least 6 characters."
        );
  
        return;
      }
  
  
      if (!/[A-Z]/.test(password)) {
        setError(
          "Password must contain an uppercase letter."
        );
  
        return;
      }
  
  
      if (!/[a-z]/.test(password)) {
        setError(
          "Password must contain a lowercase letter."
        );
  
        return;
      }
  
  
      if (!/[0-9]/.test(password)) {
        setError(
          "Password must contain a number."
        );
  
        return;
      }
  
  
      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );
  
        return;
      }
  
  
      setLoading(true);
  
  
      try {
        await register({
          fullName:
            fullName.trim(),
  
          email:
            email.trim(),
  
          password,
        });
  
  
        navigate(
          "/login",
          {
            replace: true,
  
            state: {
              registered: true,
            },
          }
        );
      }
      catch (error) {
        setError(
          getApiErrorMessage(
            error,
            "Registration failed."
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
            Start your
            <br />
  
            inventory journey
            <span>.</span>
          </h1>
  
  
          <p className="auth-marketing-description">
            Create an account to manage cars,
            track inventory, and work with
            suppliers — all in one powerful system.
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
                  PLATFORM
                </span>
              </div>
  
            </div>
  
          </div>
  
        </section>
  
  
        <section className="auth-glass-card auth-register-card">
  
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
              Create Account
            </h2>
  
            <p>
              Join AutoStock and
              get started today.
            </p>
  
          </div>
  
  
          <form
            className="auth-dark-form"
            onSubmit={handleSubmit}
          >
  
            <div className="auth-dark-group">
  
              <label htmlFor="fullName">
                Full Name
              </label>
  
  
              <div className="auth-input-wrapper">
  
                <User
                  size={19}
                />
  
                <input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(
                      event.target.value
                    )
                  }
                  autoComplete="name"
                  required
                />
  
              </div>
  
            </div>
  
  
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
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
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
  
  
            <div className="auth-dark-group">
  
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>
  
  
              <div className="auth-input-wrapper">
  
                <LockKeyhole
                  size={19}
                />
  
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  required
                />
  
  
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current
                    )
                  }
                >
                  {showConfirmPassword ? (
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
  
  
            <p className="auth-password-hint">
              Minimum 6 characters with
              uppercase, lowercase and a number.
            </p>
  
  
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
                ? "Creating Account..."
                : "Create Account"}
            </button>
  
          </form>
  
  
          <div className="auth-card-divider" />
  
  
          <p className="auth-bottom-link">
  
            Already have an account?{" "}
  
            <Link to="/login">
              Login
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
  
  
  export default RegisterPage;