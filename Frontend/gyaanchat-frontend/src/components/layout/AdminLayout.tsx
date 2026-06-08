import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { Bot, Building2, FileText, LayoutDashboard, LogOut, ChevronUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import myLogo from "../../assets/gyaanchatlogo.png";

const NAV = [
  { to: "/admin/dashboard",      icon: LayoutDashboard, label: "Dashboard"     },
  { to: "/admin/accounts",       icon: Building2,       label: "Accounts"      },
  { to: "/admin/bots",           icon: Bot,             label: "Bots"          },
  { to: "/admin/documents",      icon: FileText,        label: "Documents"     },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {/* Brand */}
        <Link to="/admin" className="sidebar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src={myLogo} alt="GyaanChat Logo" className="sidebar-logo" />
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">GyaanChat</span>
            <span className="sidebar-brand-sub">Platform Admin</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/admin"}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <n.icon size={20} />
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer" ref={popoverRef}>
          {popoverOpen && (
            <div className="user-popover">
              <button className="popover-item danger" onClick={handleLogout}>
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}

          <div className="sidebar-user" onClick={() => setPopoverOpen((v) => !v)}>
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name || "Admin"}</div>
              <div className="user-email">{user?.email || ""}</div>
            </div>
            <ChevronUp size={12} style={{ opacity: 0.4, flexShrink: 0 }} />
          </div>
        </div>
      </aside>

      <div className="app-main">
        {/* Main scrollable content matching tenant page structures */}
        <div className="app-content" style={{ padding: "32px 36px" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
