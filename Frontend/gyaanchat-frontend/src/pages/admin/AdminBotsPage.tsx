import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface Bot { id: string; name: string; tenant_name: string; theme_color: string; temperature: string; messages: number; created_at: string; }

export default function AdminBotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    api.get("/admin/bots", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setBots(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const filtered = bots.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.tenant_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div><h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Bot Management</h1><p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>All deployed bots across the platform.</p></div>
        <input className="input" placeholder="Search bots…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240, margin: 0 }} />
      </div>
      <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, overflow: "hidden" }}>
        {loading ? <p style={{ padding: 24, color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead style={{ background: "var(--color-bg,#0f1117)", borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
              <tr>{["Bot Name","Tenant","Theme","Temperature","Messages","Created"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", color: "var(--color-text-muted,#94a3b8)" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{b.name}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)" }}>{b.tenant_name}</td>
                  <td style={{ padding: "10px 14px" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 14, height: 14, borderRadius: "50%", background: b.theme_color, border: "2px solid var(--color-border,#2a2d3a)" }} /><span style={{ fontFamily: "monospace", fontSize: "0.72rem" }}>{b.theme_color}</span></div></td>
                  <td style={{ padding: "10px 14px" }}>{b.temperature}</td>
                  <td style={{ padding: "10px 14px" }}>{b.messages}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.72rem" }}>{b.created_at ? new Date(b.created_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted,#94a3b8)" }}>No bots found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
