import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, ArrowLeft, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Card";

export default function Auth({ onBack, onSuccess, initialMode = "signin" }) {
  const [mode, setMode] = React.useState(initialMode);
  const [isLoading, setIsLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [resetToken, setResetToken] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const isSignup = mode === "signup";
      const isForgot = mode === "forgot";
      const isResetToken = mode === "resetToken";

      if (isForgot && !email) {
        throw new Error("Email is required");
      }

      if (isResetToken && !resetToken) {
        throw new Error("Reset token is required");
      }

      if (isResetToken && password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      let url, body;

      if (isSignup) {
        url = "/api/auth/signup";
        body = { name, email, password };
      } else if (isForgot) {
        url = "/api/auth/forgot-password";
        body = { email };
      } else if (isResetToken) {
        url = "/api/auth/reset-password";
        body = { email, resetToken, newPassword: password };
      } else {
        url = "/api/auth/signin";
        body = { email, password };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Request failed");

      if (isForgot) {
        setIsLoading(false);
        setMessage("✓ Reset link sent to your email! Check your inbox for the reset token or copy-paste it below.");
        setMode("resetToken");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setResetToken("");
        return;
      }

      if (isResetToken) {
        setIsLoading(false);
        setMessage("Password reset successfully! Sign in with your new password.");
        setMode("signin");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setResetToken("");
        return;
      }

      if (data.token) {
        try {
          localStorage.setItem("sv_token", data.token);
          localStorage.setItem("sv_user", JSON.stringify(data.user || {}));
        } catch (e) { }
      }

      setIsLoading(false);
      onSuccess();
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "Auth failed");
    }
  };

  return (
    <div className="min-h-screen d-flex align-items-center justify-content-center p-3 bg-light" style={{ backgroundColor: '#f0f2f5' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card shadow-lg overflow-hidden border-0"
        style={{ maxWidth: '480px', width: '100%', borderRadius: '24px' }}
      >
        {/* Header Visual */}
        <div className="p-5 text-center text-white position-relative" style={{ backgroundColor: 'var(--primary-color)' }}>
          <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10 pointer-events-none">
            <svg className="w-100 h-100" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="0" cy="0" r="40" fill="white" />
              <circle cx="100" cy="100" r="30" fill="white" />
            </svg>
          </div>

          <button
            onClick={onBack}
            className="position-absolute top-0 start-0 m-4 btn btn-link text-white opacity-75 hover-opacity-100 p-0"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="bg-white rounded-4 d-inline-flex align-items-center justify-content-center text-primary mb-3 shadow-sm mx-auto" style={{ width: '56px', height: '56px' }}>
            <Shield size={28} />
          </div>
          <h3 className="h4 fw-bold mb-1">Sovereign Archive</h3>
          <p className="small opacity-75 mb-0">Secure and private intellectual capital vault</p>
        </div>

        <div className="p-4 p-md-5 bg-white">
          <div className="text-center mb-4">
            <h4 className="fw-bold mb-2">
              {mode === "signin" ? "Welcome Back" : mode === "signup" ? "Create Vault" : mode === "forgot" ? "Reset Password" : mode === "resetToken" ? "Verify & Reset Password" : "Reset Password"}
            </h4>
            <p className="text-muted small">
              {mode === "signin"
                ? "Securely access your records"
                : mode === "signup"
                  ? "Initialize your zero-knowledge archive"
                  : mode === "forgot"
                    ? "Enter your email to receive a reset token"
                    : "Enter your reset token and new password"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="row g-3">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="signup-name"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="col-12"
                >
                  <div className="position-relative">
                    <User className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted opacity-50" size={18} />
                    <Input className="ps-5" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="col-12">
              <div className="position-relative">
                <Mail className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted opacity-50" size={18} />
                <Input className="ps-5" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            {mode === "resetToken" && (
              <div className="col-12">
                <div className="position-relative">
                  <Lock className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted opacity-50" size={18} />
                  <Input className="ps-5" type="text" placeholder="Reset Token from Email" value={resetToken} onChange={(e) => setResetToken(e.target.value)} required />
                </div>
              </div>
            )}

            {(mode === "signin" || mode === "signup" || mode === "resetToken") && (
              <div className="col-12">
                <div className="position-relative">
                  <Lock className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted opacity-50" size={18} />
                  <Input className="ps-5" type="password" placeholder="Vault Passphrase" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
            )}

            {mode === "resetToken" && (
              <div className="col-12">
                <div className="position-relative">
                  <Lock className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted opacity-50" size={18} />
                  <Input
                    className="ps-5"
                    type="password"
                    placeholder="Confirm New Passphrase"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {message && (
              <div className="col-12">
                <div className="alert alert-success small mb-0">{message}</div>
              </div>
            )}

            {error && (
              <div className="col-12">
                <div className="alert alert-danger small mb-0">{error}</div>
              </div>
            )}

            {mode === "signin" && (
              <div className="col-12 text-end">
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                    setMessage("");
                  }}
                  className="btn btn-link p-0 text-decoration-none small"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div className="col-12 mt-4">
              <Button
                type="submit"
                className="w-100 py-3 rounded-pill d-flex align-items-center justify-content-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                ) : (
                  <>
                    {mode === "signin" ? "Sign In" : "Register"}
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </div>

          </form>

          <div className="mt-4 pt-3 border-top text-center">
            <p className="small text-muted mb-0">
              {mode === "signin" ? "New here?" : "Returning user?"}{" "}
              <button
                onClick={() => {
                  if (mode === "signin") setMode("signup");
                  else setMode("signin");
                  setError("");
                  setMessage("");
                }}
                className="btn btn-link text-decoration-none p-0 text-primary fw-bold"
              >
                {mode === "signin" ? "Create an account" : "Log in to vault"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
