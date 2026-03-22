import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface Doc { doc_id: string; filename: string; tenant_id: string; status: string; error?: string; updated_at: string; }
const SC: Record<string, string> = { completed: "#10b981", processing: "#f59e0b", failed: "#ef4444" };

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    api.get("/admin/documents", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setDocs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const filtered = docs.filter(d => (d.filename || "").toLowerCase().includes(search.toLowerCase()) || d.status.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div><h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Document Management</h1><p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>Monitor document processing jobs across all tenants.</p></div>
        <input className="input" placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240, margin: 0 }} />
      </div>
      <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, overflow: "hidden" }}>
        {loading ? <p style={{ padding: 24, color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead style={{ background: "var(--color-bg,#0f1117)", borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
              <tr>{["Filename","Tenant","Status","Error","Updated"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", color: "var(--color-text-muted,#94a3b8)" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.doc_id} style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{d.filename || "—"}</td>
                  <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)" }}>{d.tenant_id?.slice(0,8)}…</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: `${SC[d.status] || "#888"}20`, color: SC[d.status] || "#888" }}>{d.status}</span></td>
                  <td style={{ padding: "10px 14px", color: "#ef4444", fontSize: "0.72rem" }}>{d.error || "—"}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.72rem" }}>{d.updated_at ? new Date(d.updated_at).toLocaleString() : "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted,#94a3b8)" }}>No documents found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
