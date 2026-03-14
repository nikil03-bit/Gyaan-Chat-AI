import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import Skeleton from "../../components/ui/Skeleton";

interface Summary {
    total_messages: number;
    total_documents: number;
    avg_sources: number;
    messages_today: number;
}

interface RecentLog {
    question: string;
    answer_preview: string;
    source_count: number;
    created_at: string;
}

function timeAgo(iso: string) {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
    const { user, tenant, bot } = useAuth();
    const navigate = useNavigate();
    const tenantId = tenant?.id || localStorage.getItem("gyaanchat_tenant_id") || "";

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [recent, setRecent] = useState<RecentLog[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!tenantId) return;
        Promise.all([
            api.get("/analytics/summary").catch(() => api.get(`/analytics/stats?tenant_id=${tenantId}`)),
            api.get("/analytics/recent").catch(() => api.get(`/analytics/questions?tenant_id=${tenantId}`)),
        ])
            .then(([sRes, rRes]) => {
                const s = sRes.data;
                setSummary({ total_messages: s.total_messages ?? 0, total_documents: s.total_documents ?? 0, avg_sources: s.avg_sources ?? 0, messages_today: s.messages_today ?? 0 });
                const logs = rRes.data;
                if (Array.isArray(logs)) {
                    setRecent(logs.map((l: any) => ({ question: l.question || l.message || "", answer_preview: l.answer_preview || "", source_count: l.source_count ?? 0, created_at: l.created_at || "" })));
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [tenantId]);

    function copyWidgetKey() {
        if (bot?.widget_key) {
            navigator.clipboard.writeText(bot.widget_key);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    }

    const STATS = [
        { label: "Total Messages", value: summary?.total_messages ?? 0 },
        { label: "Documents", value: summary?.total_documents ?? 0 },
        { label: "Messages Today", value: summary?.messages_today ?? 0 },
        { label: "Avg Sources / Answer", value: summary?.avg_sources ?? 0 },
    ];

    return (
        <div className="page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome back, {user?.name?.split(" ")[0] || "there"} 👋</h1>
                    <p className="page-subtitle">Manage your AI chatbot platform</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stat-grid">
                {STATS.map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-label">{s.label}</div>
                        {loading ? (
                            <Skeleton width="60%" height="36px" style={{ marginTop: 4 }} />
                        ) : (
                            <div className="stat-value">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Two-column: Recent + Quick Actions */}
            <div className="charts-grid">
                {/* Recent Conversations */}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--color-border)" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Recent Conversations</h2>
                    </div>
                    {loading ? (
                        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                            {[1, 2, 3].map((i) => <Skeleton key={i} height="20px" />)}
                        </div>
                    ) : recent.length === 0 ? (
                        <div className="empty-state" style={{ padding: "40px 24px" }}>
                            <div className="empty-state-icon">💬</div>
                            <div className="empty-state-title">No conversations yet</div>
                            <div className="empty-state-sub">Start testing your bot to see history here.</div>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th style={{ textAlign: "right" }}>Sources</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.slice(0, 8).map((log, i) => (
                                    <tr key={i}>
                                        <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {log.question}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <span className="badge badge-muted">{log.source_count}</span>
                                        </td>
                                        <td className="muted">{timeAgo(log.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Quick Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="card">
                        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 16 }}>Quick Actions</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {[
                                { label: "Upload Document", icon: "📄", to: "/app/documents" },
                                { label: "Test Your Bot", icon: "💬", to: "/app/test-chat" },
                                { label: "Get Embed Code", icon: "🚀", to: "/app/install" },
                            ].map((a) => (
                                <button
                                    key={a.to}
                                    className="btn-ghost"
                                    style={{ justifyContent: "flex-start", gap: 10, padding: "10px 14px" }}
                                    onClick={() => navigate(a.to)}
                                >
                                    <span>{a.icon}</span> {a.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bot Status */}
                    <div className="card">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Bot Status</h2>
                            <span className="badge badge-success">● Active</span>
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 8 }}>
                            <strong style={{ color: "var(--color-text-primary)" }}>{bot?.name || "Your Bot"}</strong>
                        </div>
                        {bot?.widget_key && (
                            <div>
                                <div className="label">Widget Key</div>
                                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <code className="mono" style={{ flex: 1, background: "var(--color-bg-input)", padding: "6px 10px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {bot.widget_key}
                                    </code>
                                    <button className="btn-ghost" style={{ padding: "6px 10px", fontSize: "0.75rem" }} onClick={copyWidgetKey}>
                                        {copied ? "✓" : "Copy"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

