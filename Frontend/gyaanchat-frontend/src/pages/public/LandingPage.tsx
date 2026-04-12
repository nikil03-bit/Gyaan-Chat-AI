import { useNavigate } from "react-router-dom";
import myLogo from "../../assets/gyaanchatlogo.png";
export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div>
            {/* ── Navbar ── */}
            <nav className="landing-nav">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={myLogo} alt="Logo" style={{ width: 44, height: 44, objectFit: "contain" }} />
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>GyaanChat</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn-ghost" onClick={() => navigate("/docs")}>Docs</button>
                    <button className="btn-ghost" onClick={() => navigate("/login")}>Login</button>
                    <button className="btn-primary" onClick={() => navigate("/register")}>Get Started</button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section style={{ background: "var(--color-bg)", padding: "0 24px" }}>
                <div className="landing-hero">
                    <h1 className="hero-title">
                        Build AI Chatbots<br />Trained on Your Docs
                    </h1>
                    <p className="hero-sub">
                        Upload your documents. Get a smart chatbot in minutes.<br />Embed it anywhere no code required.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary" style={{ padding: "12px 28px", fontSize: "1rem" }} onClick={() => navigate("/register")}>
                            Start for Free →
                        </button>
                        <button className="btn-ghost" style={{ padding: "12px 28px", fontSize: "1rem" }} onClick={() => {
                            document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                        }}>
                            See How It Works
                        </button>
                    </div>

                    {/* Mock browser window */}
                    <div className="mock-browser">
                        <div className="mock-browser-bar">
                            <div className="mock-dot" style={{ background: "#ff5f57" }} />
                            <div className="mock-dot" style={{ background: "#febc2e" }} />
                            <div className="mock-dot" style={{ background: "#28c840" }} />
                            <span style={{ marginLeft: 8, fontSize: "0.75rem", color: "var(--color-text-muted)" }}>chat.yoursite.com</span>
                        </div>
                        <div className="mock-chat">
                            <div className="mock-msg bot">👋 Hi! I'm your AI assistant. Ask me anything about our products.</div>
                            <div className="mock-msg user">What's your return policy?</div>
                            <div className="mock-msg bot">Our return policy allows returns within 30 days of purchase. Items must be in original condition. You can initiate a return from your account dashboard.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="features-section">
                <h2 className="section-title">Everything you need</h2>
                <p className="section-sub">A complete platform for building and deploying AI chatbots</p>
                <div className="features-grid">
                    {[
                        { icon: "📄", title: "Document Training", desc: "Upload PDFs and text files. Your bot learns from your content instantly." },
                        { icon: "🧠", title: "RAG-Powered Answers", desc: "Retrieval-augmented generation ensures accurate, grounded responses." },
                        { icon: "🌐", title: "Easy Embedding", desc: "One script tag. Works on any website, framework, or platform." },
                        { icon: "📊", title: "Usage Analytics", desc: "Track conversations, popular questions, and engagement metrics." },
                        { icon: "🎨", title: "Custom Branding", desc: "Match your brand with custom colors, names, and greeting messages." },
                        { icon: "🔒", title: "Isolated Per Tenant", desc: "Each account gets its own isolated knowledge base and bot instance." },
                    ].map((f) => (
                        <div key={f.title} className="feature-card">
                            <div className="feature-icon">{f.icon}</div>
                            <div className="feature-title">{f.title}</div>
                            <div className="feature-desc">{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="how-section" id="how-it-works">
                <h2 className="section-title">How it works</h2>
                <p className="section-sub">Get your AI chatbot live in three simple steps</p>
                <div className="how-steps">
                    {[
                        { n: "1", title: "Upload Docs", desc: "Add your PDFs, FAQs, or any text documents to your knowledge base." },
                        { n: "2", title: "Bot Gets Trained", desc: "GyaanChat processes and indexes your content using AI embeddings." },
                        { n: "3", title: "Embed & Go Live", desc: "Copy one script tag and paste it into your website. Done." },
                    ].map((step, i) => (
                        <div key={step.n} className="how-step">
                            <div className="how-step-num">{step.n}</div>
                            {i < 2 && <div className="how-connector" />}
                            <div className="how-step-title">{step.title}</div>
                            <div className="how-step-desc">{step.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section">
                <h2 className="cta-title">Ready to get started?</h2>
                <p className="cta-sub">Join hundreds of teams using GyaanChat to power their support.</p>
                <button className="cta-btn" onClick={() => navigate("/register")}>
                    Create your chatbot for free
                </button>
            </section>

            {/* ── Footer ── */}
            <footer className="landing-footer">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <img src={myLogo} alt="Logo" style={{ width: 32, height: 32, objectFit: "contain" }} />
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>© 2025 GyaanChat</span>
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                    {["Privacy", "Terms", "GitHub"].map((l) => (
                        <span key={l} style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", cursor: "pointer" }}>{l}</span>
                    ))}
                </div>
            </footer>
        </div>
    );
}

