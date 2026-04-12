import { NavLink, useNavigate, Link } from 'react-router-dom';
import { docsConfig } from '../../features/docs/docs-config';
import { ArrowLeft } from 'lucide-react';
import myLogo from '../../assets/gyaanchatlogo.png';

interface DocsSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function DocsSidebar({ isOpen, setIsOpen }: DocsSidebarProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile overlay — reuses the exact same class as the main sidebar */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand — identical to main Sidebar.tsx */}
        <Link to="/" className="sidebar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src={myLogo} alt="GyaanChat Logo" className="sidebar-logo" />
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">GyaanChat</span>
            <span className="sidebar-brand-sub">Documentation</span>
          </div>
        </Link>

        {/* Back to app */}
        <nav className="sidebar-nav">
          <button
            className="nav-item"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 8 }}
            onClick={() => { navigate(-1); setIsOpen(false); }}
          >
            <ArrowLeft size={18} strokeWidth={2} style={{ flexShrink: 0, opacity: 0.7 }} />
            Back
          </button>

          {docsConfig.map((category, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <div className="nav-section-label">{category.title}</div>
              {category.items.map((item) => {
                const Icon = item.Icon;
                return (
                  <NavLink
                    key={item.slug}
                    to={`/docs/${item.slug}`}
                    end
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={18} strokeWidth={2} />
                    {item.title}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
