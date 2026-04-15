import Sidebar from './Sidebar';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, subtitle }) => {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-wrapper">
        {/* ── Topbar ── */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>

          <div className="topbar-right">
            {/* Search */}
            <div className="search-wrap">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Rechercher…"
                aria-label="Rechercher"
              />
            </div>

            {/* Notifications */}
            <button className="icon-btn" aria-label="Notifications">
              <Bell size={17} />
              <span className="notif-dot" />
            </button>

            <div className="topbar-divider" aria-hidden="true" />

            {/* User pill */}
            <div className="user-pill" role="button" tabIndex={0} aria-label="Menu utilisateur">
              <div className="user-avatar">
              {user?.name 
                ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() 
                : user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-meta">
              <p className="user-name">{user?.name || user?.email?.split('@')[0] || 'Utilisateur'}</p>
              <p className="user-role">{user?.role === 'OWNER' ? 'Propriétaire' : 'Membre'}</p>
            </div>
              <ChevronDown size={14} style={{ color: 'var(--text-400)', flexShrink: 0 }} />
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
