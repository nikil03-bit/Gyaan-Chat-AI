import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [websiteName, setWebsiteName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!name || !email || !password || !websiteName) { setError("Please fill in all fields."); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
        setLoading(true);
        try {
            const { data } = await api.post("/auth/register", { name, email, password, website_name: websiteName });
            login(data);
            navigate("/app", { replace: true });
        } catch (err: any) {
            setError(err?.response?.data?.detail || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-shell">
            {/* Left decorative panel */}
            <div className="auth-left">
                <div className="auth-left-logo">
                    <div className="auth-left-logo-mark">G</div>
                    <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>GyaanChat</span>
                </div>
                <h2 className="auth-left-tagline">Start building your<br />AI chatbot today.</h2>
                <p className="auth-left-sub">
                    Free to start. No credit card required. Your bot will be live in minutes.
                </p>
                <div className="auth-testimonial">
                    <p className="auth-testimonial-text">
                        "We replaced our entire FAQ page with a GyaanChat bot. Users love it."
                    </p>
                    <p className="auth-testimonial-author">— Rahul M., CTO</p>
                </div>
            </div>

            {/* Right form panel */}
            <div className="auth-right">
                <div className="auth-form-card">
                    <h1 className="auth-form-title">Create your account</h1>
                    <p className="auth-form-sub">Get your AI chatbot up and running in minutes</p>

                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label className="label">Full Name</label>
                            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" autoComplete="name" />
                        </div>

                        <div className="form-group">
                            <label className="label">Organization / Website Name</label>
                            <input className="input" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} placeholder="My Company" />
                        </div>

                        <div className="form-group">
                            <label className="label">Email address</label>
                            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                        </div>

                        <div className="form-group">
                            <label className="label">Password</label>
                            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" autoComplete="new-password" />
                        </div>

                        {error && <div className="alert alert-error">{error}</div>}

                        <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: "11px", fontSize: "0.9375rem", marginTop: 4 }}>
                            {loading ? (
                                <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating account...</>
                            ) : "Create Account →"}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                        Already have an account?{" "}
                        <Link to="/login" className="auth-link">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

