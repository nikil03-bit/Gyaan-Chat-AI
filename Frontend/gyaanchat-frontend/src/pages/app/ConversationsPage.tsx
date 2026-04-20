import { useState, useEffect } from "react";
import { MessageSquare, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import Skeleton from "../../components/ui/Skeleton";

interface Log {
    question: string;
    answer: string;
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

export default function ConversationsPage() {
    const { tenant } = useAuth();
    const tenantId = tenant?.id || localStorage.getItem("gyaanchat_tenant_id") || "";
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!tenantId) return;
        api.get("/analytics/recent")
            .catch(() => api.get(`/analytics/questions?tenant_id=${tenantId}`))
            .then((res) => {
                const raw = res.data;
                if (Array.isArray(raw)) {
                    setLogs(raw.map((l: any) => ({
                        question: l.question || l.message || "",
                        answer: l.answer || l.answer_preview || "",
                        source_count: l.source_count ?? 0,
                        created_at: l.created_at || "",
                    })));
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [tenantId]);

    const filtered = logs.filter((l) =>
        !search || l.question.toLowerCase().includes(search.toLowerCase()) || l.answer.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Conversations</h1>
                    <p className="page-subtitle">Browse all chat interactions with your bot</p>
                </div>
                <input
                    className="input"
                    style={{ maxWidth: 280 }}
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {loading ? (
                    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height="20px" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><MessageSquare size={48} /></div>
                        <div className="empty-state-title">{search ? "No results found" : "No conversations yet"}</div>
                        <div className="empty-state-sub">{search ? "Try a different search term." : "Start testing your bot to see conversations here."}</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Question</th>
                                <th style={{ textAlign: "right" }}>Sources</th>
                                <th>Time</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((log, i) => (
                                <>
                                    <tr
                                        key={`row-${i}`}
                                        className="conv-row"
                                        onClick={() => setExpanded(expanded === i ? null : i)}
                                    >
                                        <td className="muted" style={{ width: 40 }}>{i + 1}</td>
                                        <td style={{ maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {log.question}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <span className="badge badge-muted">{log.source_count}</span>
                                        </td>
                                        <td className="muted">{timeAgo(log.created_at)}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <ChevronDown size={14} style={{ transform: expanded === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", opacity: 0.5 }} />
                                        </td>
                                    </tr>
                                    {expanded === i && (
                                        <tr key={`exp-${i}`} className="conv-expanded">
                                            <td colSpan={5}>
                                                <div className="conv-expanded-content">
                                                    <div style={{ marginBottom: 12 }}>
                                                        <div className="label">Question</div>
                                                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-primary)" }}>{log.question}</div>
                                                    </div>
                                                    <div>
                                                        <div className="label">Answer</div>
                                                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                                                            {log.answer || "No answer recorded."}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

