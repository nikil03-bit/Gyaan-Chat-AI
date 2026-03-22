import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface User { id: string; name: string; email: string; is_superadmin: boolean; tenant_name: string; tenant_active: boolean; messages: number; created_at: string; }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { token, user: currentUser } = useAuth();
  const h = { Authorization: `Bearer ${token}` };

  function load() {
    setLoading(true);
    api.get("/admin/users", { headers: h })
      .then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false));
  }
  useEffect(load, [token]);

  async function toggleRole(id: string) {
    if (!confirm("Are you sure you want to change this user's role?")) return;
    await api.patch(`/admin/users/${id}/role`, {}, { headers: h });
    load();
  }

  async function del(id: string) {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    await api.delete(`/admin/users/${id}`, { headers: h });
    load();
  }

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.tenant_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div><h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>User Management</h1><p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>All users across the platform.</p></div>
        <input className="input" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240, margin: 0 }} />
      </div>
      <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, overflow: "hidden" }}>
        {loading ? <p style={{ padding: 24, color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead style={{ background: "var(--color-bg,#0f1117)", borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
              <tr>{["Name","Email","Role","Tenant","Status","Messages","Joined","Actions"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", color: "var(--color-text-muted,#94a3b8)" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.8rem" }}>{u.email}</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: u.is_superadmin ? "#7c3aed20" : "#2563eb15", color: u.is_superadmin ? "#a855f7" : "#2563eb" }}>{u.is_superadmin ? "Super Admin" : "Tenant User"}</span></td>
                  <td style={{ padding: "10px 14px" }}>{u.tenant_name}</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: u.tenant_active ? "#10b98120" : "#ef444420", color: u.tenant_active ? "#10b981" : "#ef4444" }}>{u.tenant_active ? "Active" : "Suspended"}</span></td>
                  <td style={{ padding: "10px 14px" }}>{u.messages}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.72rem" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    {currentUser?.id !== u.id && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => toggleRole(u.id)} style={{ fontSize: "0.72rem", padding: "4px 10px", background: "transparent", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 6, cursor: "pointer", color: "var(--color-text,#e2e8f0)" }}>
                          {u.is_superadmin ? "Demote" : "Promote"}
                        </button>
                        <button onClick={() => del(u.id)} style={{ fontSize: "0.72rem", padding: "4px 10px", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 6, cursor: "pointer" }}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted,#94a3b8)" }}>No users found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
