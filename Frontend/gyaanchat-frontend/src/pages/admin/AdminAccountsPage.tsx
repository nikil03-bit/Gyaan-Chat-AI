import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Trash2, Shield, ShieldOff, Power, Users } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  is_superadmin: boolean;
  tenant_id: string;
  tenant_name: string;
  tenant_active: boolean;
  messages: number;
  created_at: string;
}

export default function AdminAccountsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();
  const h = { Authorization: `Bearer ${token}` };

  function load() {
    setLoading(true);
    api.get("/admin/users", { headers: h })
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function toggleSuperadmin(id: string) {
    if (!confirm("Are you sure you want to change this user's admin privileges?")) return;
    await api.patch(`/admin/users/${id}/role`, {}, { headers: h });
    load();
  }

  async function toggleStatus(tenant_id: string, currentStatus: boolean) {
    if (!confirm(`Are you sure you want to ${currentStatus ? "suspend" : "activate"} this organization?`)) return;
    await api.patch(`/admin/tenants/${tenant_id}/status`, {}, { headers: h });
    load();
  }

  async function delUser(id: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    await api.delete(`/admin/users/${id}`, { headers: h });
    load();
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.tenant_name && u.tenant_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={24} style={{ color: "var(--color-accent)" }} />
            Accounts Overview
          </h1>
          <p className="page-subtitle">Unified list of all users and their associated organizations.</p>
        </div>
        <input
          className="input"
          placeholder="Search by name, email, or tenant…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 280, margin: 0 }}
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
                {["Name", "Email", "Tenant", "Role", "Messages", "Created", "Actions"].map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td className="muted">{u.email}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {u.tenant_name}
                      {!u.tenant_active && (
                        <span className="badge" style={{ background: "#ef444420", color: "#ef4444" }}>Suspended</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {u.is_superadmin
                      ? <span className="badge" style={{ background: "var(--color-accent)22", color: "var(--color-accent)" }}>Super Admin</span>
                      : <span className="badge badge-muted">Standard</span>
                    }
                  </td>
                  <td>{u.messages}</td>
                  <td className="muted">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn-ghost"
                        style={{ padding: "4px 8px" }}
                        onClick={() => toggleStatus(u.tenant_id, u.tenant_active)}
                        title={u.tenant_active ? "Suspend Tenant" : "Activate Tenant"}
                      >
                        <Power size={14} color={u.tenant_active ? undefined : "#ef4444"} />
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ padding: "4px 8px" }}
                        onClick={() => toggleSuperadmin(u.id)}
                        title={u.is_superadmin ? "Revoke Admin" : "Make Admin"}
                      >
                        {u.is_superadmin ? <ShieldOff size={14} /> : <Shield size={14} />}
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ padding: "4px 8px", color: "#ef4444", borderColor: "#ef4444" }}
                        onClick={() => delUser(u.id)}
                        title="Delete User"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    <div className="empty-state" style={{ padding: "32px 0" }}>
                      <div className="empty-state-icon"><Users size={40} /></div>
                      <div className="empty-state-title">No users found</div>
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
