import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { API_BASE } from "../../api/client";

type Tab = "script" | "react" | "iframe";

export default function InstallPage() {
    const { bot } = useAuth();
    const { showToast } = useToast();
    const widgetKey = bot?.widget_key || "YOUR_WIDGET_KEY";
    const [tab, setTab] = useState<Tab>("script");

    const SNIPPETS: Record<Tab, string> = {
        script: `<!-- Add before </body> -->
<script>
  window.GyaanChatConfig = {
    widgetKey: "${widgetKey}",
        apiBase: "${API_BASE}"
  };
</script>
<script src="${API_BASE}/widget.js" defer></script>`,
        react: `// Install: npm install @gyaanchat/widget
import { GyaanChatWidget } from "@gyaanchat/widget";

export default function App() {
  return (
    <>
      {/* Your app */}
      <GyaanChatWidget
        widgetKey="${widgetKey}"
                apiBase="${API_BASE}"
      />
    </>
  );
}`,
        iframe: `<!-- Embed as an iframe -->
<iframe
    src="${API_BASE}/chat-embed?key=${widgetKey}"
  width="400"
  height="600"
  frameborder="0"
  allow="clipboard-write"
  style="border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.15);"
></iframe>`,
    };

    function copy(text: string) {
        navigator.clipboard.writeText(text);
        showToast("Copied to clipboard!", "success");
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Deployment</h1>
                    <p className="page-subtitle">Embed your AI chatbot on any website</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20 }}>
                {/* Left: Code snippets */}
                <div>
                    {/* Widget Key */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 12 }}>Your Widget Key</h2>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <code className="mono" style={{ flex: 1, background: "var(--color-bg-input)", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {widgetKey}
                            </code>
                            <button className="btn-ghost" style={{ flexShrink: 0 }} onClick={() => copy(widgetKey)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                Copy
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                        <div className="tabs" style={{ padding: "0 20px", marginBottom: 0, borderBottom: "1px solid var(--color-border)" }}>
                            {(["script", "react", "iframe"] as Tab[]).map((t) => (
                                <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                                    {t === "script" ? "🏷 Script Tag" : t === "react" ? "⚛️ React" : "🖼 iFrame"}
                                </button>
                            ))}
                        </div>
                        <div style={{ padding: 20 }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                                <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: "0.75rem" }} onClick={() => copy(SNIPPETS[tab])}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                    Copy Code
                                </button>
                            </div>
                            <pre className="code-block">{SNIPPETS[tab]}</pre>
                        </div>
                    </div>
                </div>

                {/* Right: Preview + Steps */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Widget Preview */}
                    <div className="card">
                        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 16 }}>Widget Preview</h2>
                        <div className="install-preview">
                            <div className="widget-preview-panel">
                                <div className="widget-preview-header">💬 AI Assistant</div>
                                <div className="widget-preview-msgs">
                                    <div className="widget-preview-msg bot">Hi! How can I help you today?</div>
                                    <div className="widget-preview-msg user">What are your hours?</div>
                                    <div className="widget-preview-msg bot">We're open 24/7 — I'm always here!</div>
                                </div>
                            </div>
                            <div className="widget-preview-btn">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="card">
                        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 16 }}>Quick Setup</h2>
                        {[
                            { n: "1", text: "Copy your widget key above" },
                            { n: "2", text: "Choose your integration method (Script / React / iFrame)" },
                            { n: "3", text: "Paste the code snippet into your website" },
                            { n: "4", text: "The chat button will appear on your site" },
                        ].map((step) => (
                            <div key={step.n} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                                <div style={{ width: 24, height: 24, background: "var(--color-accent)", color: "var(--color-accent-fg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                                    {step.n}
                                </div>
                                <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", paddingTop: 3 }}>{step.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

