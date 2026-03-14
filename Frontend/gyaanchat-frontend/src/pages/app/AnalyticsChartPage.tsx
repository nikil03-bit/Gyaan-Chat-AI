import { useState, useEffect } from "react";
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

// Simple bar chart using CSS (no recharts needed)
function MiniBarChart({ data, label }: { data: number[]; label: string }) {
    const max = Math.max(...data, 1);
    return (
        <div>
            <div className="chart-title">{label}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
                {data.map((v, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div
                            style={{
                                width: "100%",
                                height: `${(v / max) * 80}px`,
                                background: "var(--color-accent)",
                                borderRadius: "4px 4px 0 0",
                                opacity: 0.85,
                                minHeight: v > 0 ? 4 : 0,
                                transition: "height 0.4s ease",
                            }}
                        />
                        <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>{v}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Simple area chart using SVG
function MiniAreaChart({ data, label }: { data: number[]; label: string }) {
    const max = Math.max(...data, 1);
    const w = 400, h = 100;
    const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - (v / max) * (h - 10) }));
    const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const area = `${path} L${w},${h} L0,${h} Z`;

    return (
        <div>
            <div className="chart-title">{label}</div>
            <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 100 }}>
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={area} fill="url(#areaGrad)" />
                <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth="2" />
                {pts.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--color-accent)" />
                ))}
            </svg>
        </div>
    );
}

const PAGE_SIZE = 10;

export default function AnalyticsPage() {
    const { tenant } = useAuth();
    const tenantId = tenant?.id || localStorage.getItem("gyaanchat_tenant_id") || "";

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [logs, setLogs] = useState<RecentLog[]>([]);
    const [page, setPage] = useState(0);

    useEffect(() => {
        if (!tenantId) return;
        Promise.all([
            api.get("/analytics/summary").catch(() => api.get(`/analytics/stats?tenant_id=${tenantId}`)),
            api.get("/analytics/recent").catch(() => api.get(`/analytics/questions?tenant_id=${tenantId}`)),
        ])
            .then(([sRes, rRes]) => {
                const s = sRes.data;
                setSummary({ total_messages: s.total_messages ?? 0, total_documents: s.total_documents ?? 0, avg_sources: s.avg_sources ?? 0, messages_today: s.messages_today ?? 0 });
                const raw = rRes.data;
                if (Array.isArray(raw)) {
                    setLogs(raw.map((l: any) => ({ question: l.question || l.message || "", answer_preview: l.answer_preview || "", source_count: l.source_count ?? 0, created_at: l.created_at || "" })));
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [tenantId]);

    const STATS = [
        { label: "Total Messages", value: summary?.total_messages ?? 0 },
        { label: "Documents", value: summary?.total_documents ?? 0 },
        { label: "Messages Today", value: summary?.messages_today ?? 0 },
        { label: "Avg Sources / Answer", value: summary?.avg_sources ?? 0 },
    ];

    // Generate sparkline data from logs (messages per day, last 7 days)
    const sparkData = (() => {
        const counts = Array(7).fill(0);
        logs.forEach((l) => {
            if (!l.created_at) return;
            const daysAgo = Math.floor((Date.now() - new Date(l.created_at).getTime()) / 86400000);
            if (daysAgo >= 0 && daysAgo < 7) counts[6 - daysAgo]++;
        });
        return counts;
    })();

    const sourceData = (() => {
        const buckets = [0, 0, 0, 0, 0]; // 0,1,2,3,4+ sources
        logs.forEach((l) => { const idx = Math.min(l.source_count, 4); buckets[idx]++; });
        return buckets;
    })();

    const pageCount = Math.ceil(logs.length / PAGE_SIZE);
    const pageLogs = logs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p className="page-subtitle">Insights into your bot's performance</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stat-grid">
                {STATS.map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-label">{s.label}</div>
                        {loading ? <Skeleton width="60%" height="36px" style={{ marginTop: 4 }} /> : (
                            <div className="stat-value">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-card">
                    {loading ? <Skeleton height="120px" /> : <MiniAreaChart data={sparkData} label="Messages — Last 7 Days" />}
                </div>
                <div className="chart-card">
                    {loading ? <Skeleton height="120px" /> : <MiniBarChart data={sourceData} label="Sources per Answer (0–4+)" />}
                </div>
            </div>

            {/* Conversation Log Table */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
                    <h2 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Conversation Log</h2>
                </div>
                {loading ? (
                    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height="20px" />)}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📊</div>
                        <div className="empty-state-title">No data yet</div>
                        <div className="empty-state-sub">Conversations will appear here once users start chatting.</div>
                    </div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>Answer Preview</th>
                                    <th style={{ textAlign: "right" }}>Sources</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageLogs.map((log, i) => (
                                    <tr key={i}>
                                        <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.question}</td>
                                        <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="muted">{log.answer_preview || "—"}</td>
                                        <td style={{ textAlign: "right" }}><span className="badge badge-muted">{log.source_count}</span></td>
                                        <td className="muted">{timeAgo(log.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {pageCount > 1 && (
                            <div className="pagination">
                                <span className="pagination-info">
                                    {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, logs.length)} of {logs.length}
                                </span>
                                <div className="pagination-btns">
                                    <button className="btn-ghost" style={{ padding: "6px 12px" }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                                    <button className="btn-ghost" style={{ padding: "6px 12px" }} disabled={page >= pageCount - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

