import { useRef } from "react";
import { useToast } from "../../contexts/ToastContext";
import { useBotSettings } from "../../contexts/BotSettingsContext";

const COLOR_PRESETS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#0ea5e9", "#14b8a6"];

export default function BotSettingsPage() {
    const { showToast } = useToast();
    const { settings, loading, logoUrl, setLogoUrl, uploadLogo, patchSettings, saveSettings, saving } = useBotSettings();
    const logoInputRef = useRef<HTMLInputElement>(null);

    async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { showToast("Please select an image file.", "error"); return; }
        if (file.size > 2 * 1024 * 1024) { showToast("Logo must be under 2 MB.", "error"); return; }

        try {
            await uploadLogo(file);
            showToast("Logo uploaded!", "success");
        } catch {
            showToast("Failed to upload logo.", "error");
        }
    }

    async function handleSave() {
        try {
            await saveSettings();
            showToast("Bot settings saved!", "success");
        } catch {
            showToast("Failed to save settings.", "error");
        }
    }

    const color = settings?.theme_color || "#3b82f6";
    const botName = settings?.name || "GyaanChat Bot";

    if (loading) return (
        <div className="page">
            <div className="page-header"><h1 className="page-title">Bot Settings</h1></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
                <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 48, background: "var(--color-border)", borderRadius: "var(--radius-sm)", opacity: 0.5 }} />)}
                </div>
            </div>
        </div>
    );

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Bot Settings</h1>
                    <p className="page-subtitle">Customize your chatbot — changes reflect live in Chat Preview</p>
                </div>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Saving…</> : "Save Changes"}
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

                {/* ── Left: Form ─────────────────────────────────────────── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Identity card */}
                    <div className="card">
                        <h3 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: 18 }}>Identity</h3>

                        {/* Logo */}
                        <div className="form-group">
                            <label className="label">Bot Logo</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <div
                                    onClick={() => logoInputRef.current?.click()}
                                    style={{
                                        width: 68, height: 68, borderRadius: "50%",
                                        background: logoUrl ? "transparent" : `linear-gradient(135deg, ${color}, ${color}99)`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        overflow: "hidden", flexShrink: 0, cursor: "pointer",
                                        border: `2px solid ${color}44`,
                                        boxShadow: `0 0 0 4px ${color}18`,
                                        transition: "box-shadow 0.2s",
                                    }}
                                >
                                    {logoUrl
                                        ? <img src={logoUrl} alt="Bot logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                                    }
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <button className="btn-ghost" style={{ padding: "6px 14px", fontSize: "0.8rem" }} onClick={() => logoInputRef.current?.click()}>
                                        {logoUrl ? "Change Logo" : "Upload Logo"}
                                    </button>
                                    {logoUrl && (
                                        <button className="btn-ghost" style={{ padding: "6px 14px", fontSize: "0.8rem", color: "var(--color-danger)" }} onClick={() => setLogoUrl(null)}>
                                            Remove
                                        </button>
                                    )}
                                    <span className="muted" style={{ fontSize: "0.73rem" }}>PNG, JPG, SVG · max 2 MB</span>
                                </div>
                                <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Bot Name</label>
                            <input className="input" value={settings?.name || ""} onChange={e => patchSettings({ name: e.target.value })} placeholder="GyaanChat Bot" />
                        </div>
                    </div>

                    {/* Behaviour card */}
                    <div className="card">
                        <h3 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: 18 }}>Behaviour</h3>

                        <div className="form-group">
                            <label className="label">Greeting Message</label>
                            <textarea className="input" value={settings?.greeting || ""} onChange={e => patchSettings({ greeting: e.target.value })} rows={2} placeholder="Hi! How can I help you today?" />
                            <span className="muted" style={{ fontSize: "0.73rem" }}>Shown when a visitor opens the widget</span>
                        </div>

                        <div className="form-group">
                            <label className="label">Fallback Message</label>
                            <textarea className="input" value={settings?.fallback || ""} onChange={e => patchSettings({ fallback: e.target.value })} rows={2} placeholder="I couldn't find that in your documents." />
                            <span className="muted" style={{ fontSize: "0.73rem" }}>Shown when no relevant answer is found</span>
                        </div>

                        <div className="form-group">
                            <label className="label">Response Style</label>
                            <select className="input" value={settings?.temperature || "0.2"} onChange={e => patchSettings({ temperature: e.target.value })}>
                                <option value="0.0">Precise — strictly factual</option>
                                <option value="0.2">Balanced — recommended</option>
                                <option value="0.5">Conversational — more natural</option>
                                <option value="0.7">Creative — varied responses</option>
                                <option value="1.0">Very Creative — maximum variation</option>
                            </select>
                        </div>
                    </div>

                    {/* Appearance card */}
                    <div className="card">
                        <h3 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: 18 }}>Appearance</h3>
                        <div className="form-group">
                            <label className="label">Theme Color</label>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <input type="color" value={color} onChange={e => patchSettings({ theme_color: e.target.value })}
                                    style={{ width: 44, height: 40, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", background: "none", padding: 2 }} />
                                <input className="input" value={color} onChange={e => patchSettings({ theme_color: e.target.value })} placeholder="#3b82f6" style={{ flex: 1, fontFamily: "monospace" }} />
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                                {COLOR_PRESETS.map(c => (
                                    <button key={c} onClick={() => patchSettings({ theme_color: c })} title={c}
                                        style={{
                                            width: 30, height: 30, borderRadius: "50%", background: c, border: "none",
                                            cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
                                            outline: color === c ? `3px solid ${c}` : "none", outlineOffset: 3,
                                            boxShadow: color === c ? `0 0 0 5px ${c}22` : "none",
                                            transform: color === c ? "scale(1.15)" : "scale(1)",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right: Live Preview ─────────────────────────────────── */}
                <div style={{ position: "sticky", top: 24 }}>
                    {/* Live badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 0 3px #10b98133" }} />
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Live Preview</span>
                    </div>

                    <div className="card" style={{ padding: 0, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                        {/* Widget header */}
                        <div style={{
                            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                            padding: "16px 18px",
                            display: "flex", alignItems: "center", gap: 12,
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: "50%",
                                background: "rgba(255,255,255,0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden", flexShrink: 0,
                                border: "2px solid rgba(255,255,255,0.4)",
                            }}>
                                {logoUrl
                                    ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                                }
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>{botName}</div>
                                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 4 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                                    Online
                                </div>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </div>

                        {/* Messages */}
                        <div style={{ padding: 16, minHeight: 240, display: "flex", flexDirection: "column", gap: 10, background: "var(--color-bg)" }}>
                            {/* Greeting bubble */}
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
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
                                <div style={{
                                    maxWidth: "78%", padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
                                    background: "var(--color-bg-card)", color: "var(--color-text)",
                                    fontSize: "0.82rem", lineHeight: 1.5,
                                    border: "1px solid var(--color-border)",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                }}>
                                    {settings?.greeting || "Hi! How can I help you today?"}
                                </div>
                            </div>

                            {/* Sample user message */}
                            <div style={{
                                alignSelf: "flex-end", maxWidth: "78%", padding: "10px 14px", borderRadius: "16px 16px 4px 16px",
                                background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: "#fff",
                                fontSize: "0.82rem", lineHeight: 1.5, boxShadow: `0 2px 8px ${color}44`
                            }}>
                                What can you help me with?
                            </div>

                            {/* Fallback bubble */}
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
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
                                <div style={{
                                    maxWidth: "78%", padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
                                    background: "var(--color-bg-card)", color: "var(--color-text)",
                                    fontSize: "0.82rem", lineHeight: 1.5,
                                    border: "1px solid var(--color-border)",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                }}>
                                    {settings?.fallback || "I couldn't find that in your documents."}
                                </div>
                            </div>
                        </div>

                        {/* Input bar */}
                        <div style={{ display: "flex", gap: 8, padding: "12px 14px", borderTop: "1px solid var(--color-border)", background: "var(--color-bg-card)" }}>
                            <div style={{ flex: 1, padding: "9px 13px", border: "1px solid var(--color-border)", borderRadius: 10, fontSize: "0.8rem", color: "var(--color-text-muted)", background: "var(--color-bg)" }}>
                                Type a message…
                            </div>
                            <button style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", boxShadow: `0 2px 8px ${color}44` }}>
                                Send
                            </button>
                        </div>

                        {/* Footer note */}
                        <div style={{ padding: "8px 14px", background: "var(--color-bg)", borderTop: "1px solid var(--color-border)", textAlign: "center" }}>
                            <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>✦ Updates live as you edit · Go to <strong>Chat Preview</strong> to test for real</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

