import logo from "../assets/final.png";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Forgotpass() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Auto-fill email if passed from previous step or localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("resetEmail") || localStorage.getItem("emailId");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // =========================
    // VALIDATIONS
    // =========================
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }

    try {
      setLoading(true);

      // =========================
      // CALL BACKEND API
      // =========================
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to reset password.");
        return;
      }

      // =========================
      // SUCCESS
      // =========================
      setSuccess("Password updated successfully! Notification sent to your email. Redirecting to login...");

      localStorage.removeItem("resetEmail");

      setNewPassword("");
      setConfirmPassword("");

      // Redirect to login page after 1.5s
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error);
      setError("Unable to connect to server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow-lg p-4 rounded-4 border-0" style={{ width: "420px" }}>
        
        {/* Logo & Header */}
        <div className="text-center mb-4">
          <img
            src={logo}
            alt="logo"
            width="50"
            height="50"
            className="rounded mb-2"
          />
          <h4 className="fw-bold mb-1">Reset Password</h4>
          <p className="text-muted fs-7">
            Enter your registered email and create a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="text-start">
          {/* Registered Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold fs-7 text-secondary">
              Registered Email Address
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div className="mb-3">
            <label className="form-label fw-semibold fs-7 text-secondary">
              New Password
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <label className="form-label fw-semibold fs-7 text-secondary">
              Confirm New Password
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-shield-lock"></i>
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </div>
          </div>

          {/* Alert Feedback Messages */}
          {error && (
            <div className="alert alert-danger py-2 px-3 fs-8 mb-3 border-0 rounded-3">
              <i className="bi bi-exclamation-triangle-fill me-1.5"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success py-2 px-3 fs-8 mb-3 border-0 rounded-3">
              <i className="bi bi-check-circle-fill me-1.5"></i>
              {success}
            </div>
          )}

          <button
            className="btn btn-primary w-100 py-2.5 fw-semibold rounded-3 shadow-sm mt-2"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Updating Password...
              </>
            ) : (
              "Update Password & Continue to Login"
            )}
          </button>
        </form>

        <div className="text-center mt-4 border-top pt-3">
          <Link to="/login" className="fw-semibold text-primary text-decoration-none fs-7">
            <i className="bi bi-arrow-left me-1"></i> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Forgotpass;