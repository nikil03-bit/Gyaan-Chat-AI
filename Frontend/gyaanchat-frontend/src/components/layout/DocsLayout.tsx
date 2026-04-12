import React, { useState, useEffect } from 'react';
import DocsSidebar from '../docs/DocsSidebar';
import { useLocation } from 'react-router-dom';
import '../../styles/docs.css';

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <DocsSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="app-main">
        {/* Topbar — matches main app exactly */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-btn hamburger"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="topbar-title">Documentation</span>
          </div>
          <div className="topbar-right" />
        </header>

        <div className="app-content">
          <div className="docs-content-container">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
