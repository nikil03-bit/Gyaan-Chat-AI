import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Bot,
  MessageSquare,
  BarChart3,
  MessagesSquare,
  Code2,
  Settings,
  User,
  LogOut,
  ChevronUp,
} from "lucide-react";
import myLogo from "../../assets/gyaanchatlogo.png";

interface NavItemDef {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItemDef[] = [
  {
    to: "/app",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    to: "/app/documents",
    label: "Knowledge Base",
    icon: <FileText size={20} />,
  },
  {
    to: "/app/bot-settings",
    label: "Bot Settings",
    icon: <Bot size={20} />,
  },
  {
    to: "/app/test-chat",
    label: "Chat Preview",
    icon: <MessageSquare size={20} />,
  },
  {
    to: "/app/analytics",
    label: "Analytics",
    icon: <BarChart3 size={20} />,
  },
  {
    to: "/app/conversations",
    label: "Conversations",
    icon: <MessagesSquare size={20} />,
  },
  {
    to: "/app/install",
    label: "Deployment",
    icon: <Code2 size={20} />,
  },
  {
    to: "/app/settings",
    label: "Settings",
    icon: <Settings size={20} />,
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

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
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Brand */}
        <Link to="/" className="sidebar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src={myLogo} alt="GyaanChat Logo" className="sidebar-logo" />
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">GyaanChat</span>
            <span className="sidebar-brand-sub">AI Platform</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer" ref={popoverRef}>
          {popoverOpen && (
            <div className="user-popover">
              <button
                className="popover-item"
                onClick={() => {
                  setPopoverOpen(false);
                  navigate("/app/profile");
                  onClose();
                }}
              >
                <User size={14} />
                Profile
              </button>
              <button className="popover-item danger" onClick={handleLogout}>
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}

          <div className="sidebar-user" onClick={() => setPopoverOpen((v) => !v)}>
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name || "User"}</div>
              <div className="user-email">{user?.email || ""}</div>
            </div>
            <ChevronUp size={12} style={{ opacity: 0.4, flexShrink: 0 }} />
          </div>
        </div>
      </aside>
    </>
  );
}

