import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Trash2, Shield, ShieldOff, Power } from "lucide-react";

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
    if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this organization?`)) return;
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
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Accounts Overview</h1>
          <p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>
            Unified list of all users and their associated organizations.
          </p>
        </div>
        <input 
          className="input" 
          placeholder="Search by name, email, or tenant…" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ width: 280, margin: 0 }} 
        />
      </div>
      
      <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, overflow: "hidden" }}>
        {loading ? <p style={{ padding: 24, color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead style={{ background: "var(--color-bg,#0f1117)", borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
              <tr>
                {["Name", "Email", "Tenant", "Role", "Messages", "Created", "Actions"].map(h => 
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", color: "var(--color-text-muted,#94a3b8)" }}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.8rem" }}>{u.email}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 500 }}>
                    <div style={{display: "flex", alignItems: "center", gap: 6}}>
                       {u.tenant_name}
                       {!u.tenant_active && <span style={{fontSize: "0.6rem", background:"#ef444420", color:"#ef4444", padding:"2px 6px", borderRadius: 4}}>Suspended</span>}
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {u.is_superadmin 
                      ? <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: "#7c3aed20", color: "#a855f7" }}>Super Admin</span>
                      : <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: "#33415550", color: "#94a3b8" }}>Standard</span>
                    }
                  </td>
                  <td style={{ padding: "10px 14px" }}>{u.messages}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.72rem" }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => toggleStatus(u.tenant_id, u.tenant_active)} title={u.tenant_active ? "Suspend Tenant" : "Activate Tenant"} style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", padding: "4px 8px", background: "transparent", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 6, cursor: "pointer", color: "var(--color-text,#e2e8f0)" }}>
                         <Power size={14} color={u.tenant_active ? "#e2e8f0" : "#ef4444"} />
                      </button>
                      <button onClick={() => toggleSuperadmin(u.id)} title={u.is_superadmin ? "Revoke Admin" : "Make Admin"} style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", padding: "4px 8px", background: "transparent", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 6, cursor: "pointer", color: "var(--color-text,#e2e8f0)" }}>
                         {u.is_superadmin ? <ShieldOff size={14} /> : <Shield size={14} />}
                      </button>
                      <button onClick={() => delUser(u.id)} title="Delete User" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", padding: "4px 8px", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 6, cursor: "pointer" }}>
                         <Trash2 size={14}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted,#94a3b8)" }}>No users found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
