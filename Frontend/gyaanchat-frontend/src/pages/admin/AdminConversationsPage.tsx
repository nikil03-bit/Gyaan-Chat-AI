import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface ConvRow { id: string; tenant_name: string; bot_id: string; source_count: number; created_at: string; }
interface Summary { tenant_name: string; messages: number; }

export default function AdminConversationsPage() {
  const [rows, setRows] = useState<ConvRow[]>([]);
  const [summary, setSummary] = useState<Summary[]>([]);
  const [tab, setTab] = useState<"summary" | "recent">("summary");
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const hdr = { Authorization: `Bearer ${token}` };
    setLoading(true);
    Promise.all([api.get("/admin/conversations", { headers: hdr }), api.get("/admin/conversations/summary", { headers: hdr })])
      .then(([r1, r2]) => { setRows(r1.data); setSummary(r2.data); }).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Conversations & Usage</h1>
        <p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>Platform-wide chat activity. Raw message text is hidden to protect tenant privacy.</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["summary", "recent"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 16px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", border: "1px solid var(--color-border,#2a2d3a)", background: tab === t ? "#7c3aed" : "transparent", color: tab === t ? "#fff" : "var(--color-text,#e2e8f0)" }}>{t === "summary" ? "By Tenant" : "Recent Events"}</button>
        ))}
      </div>
      {loading ? <p style={{ color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : (
        <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            {tab === "summary" ? (
              <>
                <thead style={{ background: "var(--color-bg,#0f1117)", borderBottom: "1px solid var(--color-border,#2a2d3a)" }}><tr>{["Tenant","Total Messages"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", color: "var(--color-text-muted,#94a3b8)" }}>{h}</th>)}</tr></thead>
                <tbody>{summary.map((s, i) => (<tr key={i} style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}><td style={{ padding: "10px 14px", fontWeight: 600 }}>{s.tenant_name}</td><td style={{ padding: "10px 14px" }}>{s.messages.toLocaleString()}</td></tr>))}{summary.length === 0 && <tr><td colSpan={2} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted,#94a3b8)" }}>No data.</td></tr>}</tbody>
              </>
            ) : (
              <>
                <thead style={{ background: "var(--color-bg,#0f1117)", borderBottom: "1px solid var(--color-border,#2a2d3a)" }}><tr>{["Tenant","Bot","Sources","Time"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", color: "var(--color-text-muted,#94a3b8)" }}>{h}</th>)}</tr></thead>
                <tbody>{rows.map(r => (<tr key={r.id} style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}><td style={{ padding: "10px 14px", fontWeight: 600 }}>{r.tenant_name}</td><td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)" }}>{r.bot_id?.slice(0,8)}…</td><td style={{ padding: "10px 14px" }}>{r.source_count}</td><td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.72rem" }}>{r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</td></tr>))}{rows.length === 0 && <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted,#94a3b8)" }}>No events.</td></tr>}</tbody>
              </>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
