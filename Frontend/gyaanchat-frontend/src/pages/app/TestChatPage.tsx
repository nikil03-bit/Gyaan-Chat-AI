import { useMemo, useState, useRef, useEffect } from "react";
import { chatTenant } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useBotSettings } from "../../contexts/BotSettingsContext";
import { useNavigate } from "react-router-dom";

type Msg = {
    role: "user" | "assistant";
    text: string;
    sources?: Array<{ doc_id: string; chunk_index: number; filename: string }>;
};

export default function TestChatPage() {
    const { tenant } = useAuth();
    const navigate = useNavigate();
    const tenantId = useMemo(() => tenant?.id || localStorage.getItem("gyaanchat_tenant_id"), [tenant]);
    const { settings, loading: settingsLoading, logoUrl } = useBotSettings();

    const [input, setInput] = useState("");
    const [msgs, setMsgs] = useState<Msg[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Set greeting as first message when settings load
    useEffect(() => {
        if (settings?.greeting) {
            setMsgs([{ role: "assistant", text: settings.greeting }]);
        }
    }, [settings?.greeting]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [msgs, busy]);

    async function send() {
        if (!tenantId) return;
        const q = input.trim();
        if (!q || busy) return;
        setError("");
        setMsgs(m => [...m, { role: "user", text: q }]);
        setInput("");
        setBusy(true);
        try {
            const res = await chatTenant(tenantId, q);
            let answer = res.answer || "I'm not sure how to answer that.";
            if (settings?.fallback && (answer.includes("couldn't find") || answer.includes("I don't know"))) {
                answer = settings.fallback;
            }
            setMsgs(m => [...m, { role: "assistant", text: answer, sources: res.sources }]);
        } catch (e: any) {
            setError(e?.message || "Chat request failed. Is the backend running?");
        } finally {
            setBusy(false);
        }
    }

    const color = settings?.theme_color || "#3b82f6";
    const botName = settings?.name || "AI Assistant";

    if (!tenantId) return (
        <div className="page">
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
                <h3>Tenant not found</h3>
                <p className="muted">Please login again to access the chat.</p>
            </div>
        </div>
    );

    return (
        <div className="page" style={{ height: "calc(100vh - var(--topbar-height))", display: "flex", flexDirection: "column", paddingBottom: 0 }}>
            <div className="page-header" style={{ marginBottom: 20 }}>
                <div>
                    <h1 className="page-title">Chat Preview</h1>
                    <p className="page-subtitle">Live test of your AI assistant — reflects your Bot Settings</p>
                </div>
                <button className="btn-ghost" style={{ fontSize: "0.82rem" }} onClick={() => navigate("/app/bot-settings")}>
                    ⚙ Edit Bot Settings
                </button>
            </div>

            <div className="chat-layout" style={{ flex: 1, minHeight: 0 }}>

                {/* Left: Bot Config Panel */}
                <div className="card" style={{ overflow: "auto" }}>
                    <h2 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: 16 }}>
                        Bot Config
                    </h2>

                    {/* Bot avatar + name */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "14px", borderRadius: "var(--radius)", background: `${color}12`, border: `1px solid ${color}30` }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                            background: logoUrl ? "transparent" : `linear-gradient(135deg, ${color}, ${color}99)`,
                            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                            border: `2px solid ${color}44`,
                        }}>
                            {logoUrl
                                ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                            }
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{botName}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                                <span className="muted" style={{ fontSize: "0.72rem" }}>Online</span>
                            </div>
                        </div>
                    </div>

                    {settingsLoading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 14, background: "var(--color-border)", borderRadius: 4, opacity: 0.5 }} />)}
                        </div>
                    ) : settings ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {[
                                { label: "Temperature", value: settings.temperature || "0.2" },
                                { label: "Greeting", value: settings.greeting?.slice(0, 55) + (settings.greeting?.length > 55 ? "…" : "") },
                                { label: "Fallback", value: settings.fallback?.slice(0, 55) + (settings.fallback?.length > 55 ? "…" : "") },
                            ].map(item => (
                                <div key={item.label}>
                                    <div className="label" style={{ marginBottom: 3 }}>{item.label}</div>
                                    <div style={{ fontSize: "0.82rem", color: "var(--color-text)" }}>{item.value || "—"}</div>
                                </div>
                            ))}
                            <div>
                                <div className="label" style={{ marginBottom: 6 }}>Theme Color</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: color, border: "2px solid var(--color-border)", boxShadow: `0 0 0 3px ${color}33` }} />
                                    <span style={{ fontSize: "0.82rem", fontFamily: "monospace" }}>{color}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="muted">Could not load settings.</p>
                    )}

                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
                        <button className="btn-ghost" style={{ width: "100%", fontSize: "0.8rem", justifyContent: "center" }} onClick={() => navigate("/app/bot-settings")}>
                            ✏ Edit in Bot Settings
                        </button>
                    </div>
                </div>

                {/* Right: Chat Window */}
                <div className="chat-window" style={{ display: "flex", flexDirection: "column" }}>
                    {/* Chat header */}
                    <div className="chat-header" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, borderRadius: "var(--radius) var(--radius) 0 0" }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: logoUrl ? "transparent" : "rgba(255,255,255,0.2)",
                            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                            border: "2px solid rgba(255,255,255,0.35)", flexShrink: 0,
                        }}>
                            {logoUrl
                                ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                            }
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#fff" }}>{botName}</div>
                            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                                Online · Test Mode
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages" ref={scrollRef} style={{ flex: 1 }}>
                        {msgs.length === 0 && !busy && (
                            <div style={{ textAlign: "center", padding: "40px 0" }} className="muted">
                                No messages yet. Ask something about your documents!
                            </div>
                        )}
                        {msgs.map((m, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                                {m.role === "assistant" && (
                                    <div style={{
                                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                        background: logoUrl ? "transparent" : `linear-gradient(135deg, ${color}, ${color}99)`,
                                        overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        {logoUrl
                                            ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                                        }
                                    </div>
                                )}
                                <div style={{
                                    maxWidth: "72%", padding: "10px 14px",
                                    borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                    background: m.role === "user"
                                        ? `linear-gradient(135deg, ${color}, ${color}cc)`
                                        : "var(--color-bg-card)",
                                    color: m.role === "user" ? "#fff" : "var(--color-text)",
                                    fontSize: "0.875rem", lineHeight: 1.55,
                                    border: m.role === "assistant" ? "1px solid var(--color-border)" : "none",
                                    boxShadow: m.role === "user" ? `0 2px 8px ${color}44` : "0 1px 4px rgba(0,0,0,0.06)",
                                }}>
                                    <div style={{ fontSize: "0.68rem", fontWeight: 600, opacity: 0.65, marginBottom: 4 }}>
                                        {m.role === "user" ? "You" : botName}
                                    </div>
                                    {m.text}
                                    {m.sources && m.sources.length > 0 && (
                                        <div className="chat-sources" style={{ marginTop: 8 }}>
                                            {m.sources.map((s, idx) => (
                                                <span key={idx} className="source-chip">{s.filename || `Doc ${s.doc_id?.slice(0, 4)}…`}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {busy && (
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${color}, ${color}99)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                                </div>
                                <div className="chat-bubble bot" style={{ padding: "12px 16px" }}>
                                    <div className="typing-dots"><span /><span /><span /></div>
                                </div>
                            </div>
                        )}
                        {error && <div className="alert alert-error">{error}</div>}
                    </div>

                    {/* Input bar */}
                    <div className="chat-input-bar">
                        <input
                            className="input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Type your message..."
                            onKeyDown={e => e.key === "Enter" && send()}
                            disabled={busy}
                            style={{ margin: 0 }}
                        />
                        <button
                            onClick={send}
                            disabled={busy || !input.trim()}
                            style={{
                                flexShrink: 0, border: "none", borderRadius: "var(--radius-sm)",
                                padding: "0 18px", height: 40, cursor: "pointer", fontWeight: 700,
                                fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6,
                                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                                color: "#fff", boxShadow: `0 2px 8px ${color}44`,
                                opacity: busy || !input.trim() ? 0.5 : 1,
                                transition: "opacity 0.15s",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                            {busy ? "…" : "Send"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

