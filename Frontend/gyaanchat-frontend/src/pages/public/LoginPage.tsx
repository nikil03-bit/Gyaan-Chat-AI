import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import myLogo from "../../assets/gyaanchatlogo.png";

export default function LoginPage() {
  const [view, setView] = useState<"login" | "forgot" | "reset">("login");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data);
      if (data.user?.is_superadmin) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function onForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setView("reset");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  }

  async function onResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!resetCode || !newPassword) { setError("Please enter the code and a new password."); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, code: resetCode, new_password: newPassword });
      setView("login");
      setPassword("");
      setSuccessMsg("Password successfully reset! You can now log in.");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      {/* Left decorative panel */}
      <div className="auth-left">
        <div className="auth-left-logo">
          <img src={myLogo} alt="Logo" className="auth-left-logo-mark" style={{ objectFit: "contain" }} />
          <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>GyaanChat</span>
        </div>
        <h2 className="auth-left-tagline">Your AI chatbot,<br />trained on your docs.</h2>
        <p className="auth-left-sub">
          Upload documents, configure your bot, and embed it anywhere — all from one dashboard.
        </p>
        <div className="auth-testimonial">
          <p className="auth-testimonial-text">
            "GyaanChat cut our support tickets by 40% in the first month. Setup took less than an hour."
          </p>
          <p className="auth-testimonial-author">— Priya S., Product Manager</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-form-card">
          {view === "login" && (
            <>
              <h1 className="auth-form-title">Welcome back</h1>
              <p className="auth-form-sub">Sign in to your GyaanChat dashboard</p>

              <form onSubmit={onSubmit}>
                <div className="form-group">
                  <label className="label">Email address</label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label className="label" style={{ margin: 0 }}>Password</label>
                    <span 
                        onClick={() => setView("forgot")}
                        style={{ fontSize: "0.75rem", color: "var(--color-primary)", cursor: "pointer", fontWeight: 500 }}
                    >
                        Forgot password?
                    </span>
                  </div>
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    autoComplete="current-password"
                  />
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {successMsg && <div className="alert alert-success" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "12px", borderRadius: "8px", fontSize: "0.875rem", marginBottom: "16px" }}>{successMsg}</div>}

                <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: "11px", fontSize: "0.9375rem", marginTop: 4 }}>
                  {loading ? (
                    <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Signing in...</>
                  ) : "Sign In"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                Don't have an account?{" "}
                <Link to="/register" className="auth-link">Create one free</Link>
              </p>
            </>
          )}

          {view === "forgot" && (
            <>
              <h1 className="auth-form-title">Reset Password</h1>
              <p className="auth-form-sub">Enter your email address to receive a verification code.</p>

              <form onSubmit={onForgotPassword}>
                <div className="form-group">
                  <label className="label">Email address</label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: "11px", fontSize: "0.9375rem", marginTop: 4 }}>
                  {loading ? (
                    <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Sending...</>
                  ) : "Send Reset Code"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                <span onClick={() => { setView("login"); setError(null); }} className="auth-link" style={{ cursor: "pointer" }}>← Back to login</span>
              </p>
            </>
          )}

          {view === "reset" && (
            <>
              <h1 className="auth-form-title">Enter Reset Code</h1>
              <p className="auth-form-sub">We sent a 6-digit code to <strong>{email}</strong></p>

              <form onSubmit={onResetPassword}>
                <div className="form-group">
                  <label className="label">Reset Code</label>
                  <input
                    className="input"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    style={{ fontSize: "1.5rem", letterSpacing: "4px", textAlign: "center", padding: "12px" }}
                  />
                </div>

                <div className="form-group">
                  <label className="label">New Password</label>
                  <input
                    className="input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                  />
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: "11px", fontSize: "0.9375rem", marginTop: 4 }}>
                  {loading ? (
                    <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Resetting...</>
                  ) : "Reset Password"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                Didn't receive the code?{" "}
                <button type="button" onClick={onForgotPassword} className="auth-link" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "inherit" }}>
                    Resend code
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

