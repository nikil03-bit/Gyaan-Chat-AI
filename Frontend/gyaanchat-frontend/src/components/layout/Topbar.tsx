import { useLocation } from "react-router-dom";

const PAGE_TITLES: Record<string, string> = {
  "/app": "Dashboard",
  "/app/documents": "Knowledge Base",
  "/app/bot-settings": "Bot Settings",
  "/app/test-chat": "Chat Preview",
  "/app/analytics": "Analytics",
  "/app/conversations": "Conversations",
  "/app/install": "Deployment",
  "/app/settings": "Settings",
  "/app/profile": "Profile",
};

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || "Dashboard";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn hamburger" onClick={onMenuClick} aria-label="Open menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="topbar-title">{title}</span>
      </div>

      <div className="topbar-right">
        <button className="icon-btn" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </div>
    </header>
  );
}
