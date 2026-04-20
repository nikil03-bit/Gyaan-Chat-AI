import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bot, Building2, FileText, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/admin/dashboard",      icon: LayoutDashboard, label: "Dashboard"     },
  { to: "/admin/accounts",       icon: Building2,       label: "Accounts"      },
  { to: "/admin/bots",           icon: Bot,             label: "Bots"          },
  { to: "/admin/documents",      icon: FileText,        label: "Documents"     },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate("/", { replace: true }); }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg, #0f1117)" }}>
      <aside style={{
        width: 220, flexShrink: 0,
        background: "var(--color-bg-card, #1a1d27)",
        borderRight: "1px solid var(--color-border, #2a2d3a)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--color-border, #2a2d3a)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1rem", flexShrink: 0 }}>G</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>GyaanChat</div>
            <div style={{ fontSize: "0.65rem", background: "#7c3aed20", color: "#a855f7", padding: "1px 6px", borderRadius: 4, display: "inline-block", marginTop: 2 }}>Super Admin</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 500,
              textDecoration: "none",
              color: isActive ? "#a855f7" : "var(--color-text, #e2e8f0)",
              background: isActive ? "#7c3aed18" : "transparent",
              transition: "all 0.15s",
            })}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <n.icon size={16} strokeWidth={2.1} />
              </span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--color-border, #2a2d3a)" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted, #94a3b8)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
          <button onClick={handleLogout} style={{ width: "100%", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 6, padding: "5px 10px", fontSize: "0.78rem", cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
        <Outlet />
      </main>
    </div>
  );
}
