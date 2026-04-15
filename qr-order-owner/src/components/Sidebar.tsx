import React, { useState } from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  UtensilsCrossed,
  QrCode,
  Users,
  Settings,
  LogOut,
  Zap,
  BarChart2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: '/', badge: null },
  { icon: ReceiptText,     label: 'Mes commandes', path: '/orders', badge: null },
  { icon: UtensilsCrossed, label: 'Menu & Cartes', path: '/menu', badge: null },
  { icon: QrCode,          label: 'Tables & QR', path: '/tables', badge: null },
  { icon: Users,           label: 'Équipe', path: '/staff', badge: '3' },
  { icon: BarChart2,       label: 'Analytiques', path: '/analytics', badge: null },
  { icon: Settings,        label: 'Paramètres', path: '/settings', badge: null },
];

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Toggle Button */}
      <button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Brand */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Zap size={20} color="#fff" fill="#fff" />
          </div>
          <div className="brand-text">
            <span className="brand-name">QR<span>Order</span></span>
            <span className="brand-sub">Owner Workspace</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {!isCollapsed && <p className="nav-section-label">Navigation</p>}
        {navItems.map(({ icon: Icon, label, path, badge }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            title={isCollapsed ? label : ""}
          >
            <span className="nav-icon"><Icon size={17} /></span>
            <span className="nav-label">{label}</span>
            {badge && !isCollapsed && <span className="nav-badge">{badge}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-restaurant-card">
          <div className="restaurant-avatar">
            {(user?.restaurant?.name || user?.email || 'B').charAt(0).toUpperCase()}
          </div>
          <div className="restaurant-info">
            <p className="restaurant-name">
              {user?.restaurant?.name || 'Mon Établissement'}
            </p>
            <div className="restaurant-status">
              <span className="status-dot" />
              Ouvert
            </div>
          </div>
        </div>

        <button 
          className="btn-logout" 
          onClick={handleLogout}
          title={isCollapsed ? "Déconnexion" : ""}
        >
          <LogOut size={17} />
          <span className="nav-label">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
