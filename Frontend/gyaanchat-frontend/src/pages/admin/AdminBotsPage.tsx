import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Bot } from "lucide-react";

interface BotItem { id: string; name: string; tenant_name: string; theme_color: string; temperature: string; messages: number; created_at: string; }

export default function AdminBotsPage() {
  const [bots, setBots] = useState<BotItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    api.get("/admin/bots", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setBots(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const filtered = bots.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.tenant_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bot size={24} style={{ color: "var(--color-accent)" }} />
            Bot Management
          </h1>
          <p className="page-subtitle">All deployed bots across the platform.</p>
        </div>
        <input
          className="input"
          placeholder="Search bots…"
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
                {["Bot Name", "Tenant", "Theme Color", "Temperature", "Messages", "Created"].map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.name}</td>
                  <td className="muted">{b.tenant_name}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: b.theme_color, border: "2px solid var(--color-border)", flexShrink: 0 }} />
                      <code className="mono" style={{ fontSize: "0.72rem" }}>{b.theme_color}</code>
                    </div>
                  </td>
                  <td><span className="badge badge-muted">{b.temperature}</span></td>
                  <td>{b.messages.toLocaleString()}</td>
                  <td className="muted">{b.created_at ? new Date(b.created_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    <div className="empty-state" style={{ padding: "32px 0" }}>
                      <div className="empty-state-icon"><Bot size={40} /></div>
                      <div className="empty-state-title">No bots found</div>
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
