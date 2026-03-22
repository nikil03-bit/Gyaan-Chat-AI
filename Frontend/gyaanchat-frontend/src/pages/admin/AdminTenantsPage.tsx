import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface Tenant { id: string; name: string; owner_email: string; is_active: boolean; bots: number; messages: number; users: number; created_at: string; }

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const h = { Authorization: `Bearer ${token}` };

  function load() {
    setLoading(true);
    api.get("/admin/tenants", { headers: h }).then(r => setTenants(r.data)).catch(console.error).finally(() => setLoading(false));
  }
  useEffect(load, [token]);

  async function toggleStatus(id: string) { await api.patch(`/admin/tenants/${id}/status`, {}, { headers: h }); load(); }
  async function del(id: string) { if (!confirm("Delete tenant and ALL their data?")) return; await api.delete(`/admin/tenants/${id}`, { headers: h }); load(); }

  const filtered = tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.owner_email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div><h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Tenant Management</h1><p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>Manage all organizations on the platform.</p></div>
        <input className="input" placeholder="Search tenants…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240, margin: 0 }} />
      </div>
      <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, overflow: "hidden" }}>
        {loading ? <p style={{ padding: 24, color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead style={{ background: "var(--color-bg,#0f1117)", borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
              <tr>{["Name","Owner","Users","Bots","Messages","Status","Created","Actions"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", color: "var(--color-text-muted,#94a3b8)" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{t.name}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.8rem" }}>{t.owner_email}</td>
                  <td style={{ padding: "10px 14px" }}>{t.users}</td>
                  <td style={{ padding: "10px 14px" }}>{t.bots}</td>
                  <td style={{ padding: "10px 14px" }}>{t.messages}</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: t.is_active ? "#10b98120" : "#ef444420", color: t.is_active ? "#10b981" : "#ef4444" }}>{t.is_active ? "Active" : "Suspended"}</span></td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.72rem" }}>{t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => toggleStatus(t.id)} style={{ fontSize: "0.72rem", padding: "4px 10px", background: "transparent", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 6, cursor: "pointer", color: "var(--color-text,#e2e8f0)" }}>{t.is_active ? "Suspend" : "Activate"}</button>
                      <button onClick={() => del(t.id)} style={{ fontSize: "0.72rem", padding: "4px 10px", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 6, cursor: "pointer" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted,#94a3b8)" }}>No tenants found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
