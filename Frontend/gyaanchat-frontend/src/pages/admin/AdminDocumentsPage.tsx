import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { FileText } from "lucide-react";

interface Doc { doc_id: string; filename: string; tenant_id: string; status: string; error?: string; updated_at: string; }

const STATUS_COLORS: Record<string, string> = {
  completed: "#10b981",
  processing: "#f59e0b",
  failed: "#ef4444",
};

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    api.get("/admin/documents", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setDocs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const filtered = docs.filter(d =>
    (d.filename || "").toLowerCase().includes(search.toLowerCase()) ||
    d.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={24} style={{ color: "var(--color-accent)" }} />
            Document Management
          </h1>
          <p className="page-subtitle">Monitor document processing jobs across all tenants.</p>
        </div>
        <input
          className="input"
          placeholder="Search documents…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 240, margin: 0 }}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 20 }} />)}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {["Filename", "Tenant ID", "Status", "Error", "Last Updated"].map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const color = STATUS_COLORS[d.status] || "#888";
                return (
                  <tr key={d.doc_id}>
                    <td style={{ fontWeight: 600 }}>{d.filename || "—"}</td>
                    <td>
                      <code className="mono" style={{ fontSize: "0.72rem" }}>{d.tenant_id?.slice(0, 8)}…</code>
                    </td>
                    <td>
                      <span className="badge" style={{ background: `${color}20`, color }}>{d.status}</span>
                    </td>
                    <td style={{ color: "#ef4444", fontSize: "0.78rem" }}>{d.error || "—"}</td>
                    <td className="muted">{d.updated_at ? new Date(d.updated_at).toLocaleString() : "—"}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    <div className="empty-state" style={{ padding: "32px 0" }}>
                      <div className="empty-state-icon"><FileText size={40} /></div>
                      <div className="empty-state-title">No documents found</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
