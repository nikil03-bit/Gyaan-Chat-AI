import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import myLogo from "../../assets/gyaanchatlogo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", cursor: "pointer" }}>Forgot password?</span>
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
        </div>
      </div>
    </div>
  );
}

