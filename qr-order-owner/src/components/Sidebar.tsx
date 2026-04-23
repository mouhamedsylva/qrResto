import React, { useState, useEffect } from 'react';
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
import { useLanguage } from '../context/LanguageContext';
import { useConfirm } from './ConfirmModal';
import api from '../services/api';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);

  const { logout, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  useEffect(() => {
    if (!user?.restaurant?.id) return;
    let isMounted = true;

    const fetchSidebarCounts = async () => {
      try {
        const promises: Promise<any>[] = [];

        if (user.role && ['OWNER', 'MANAGER', 'STAFF', 'ADMIN'].includes(user.role)) {
          promises.push(api.get(`/orders/restaurant/${user.restaurant.id}`));
        } else {
          promises.push(Promise.resolve({ data: [] }));
        }

        if (user.role && ['OWNER', 'ADMIN'].includes(user.role)) {
          promises.push(api.get(`/users/team/${user.restaurant.id}`));
        } else {
          promises.push(Promise.resolve({ data: [] }));
        }

        const [ordersRes, staffRes] = await Promise.all(promises.map(p => p.catch(() => ({ data: [] }))));

        if (isMounted) {
          const rawOrders = Array.isArray(ordersRes?.data?.data) ? ordersRes.data.data : Array.isArray(ordersRes?.data) ? ordersRes.data : [];
          const activeOrdersCount = rawOrders.filter((o: any) => ['PENDING', 'PREPARING', 'READY'].includes(o.status)).length;
          setOrdersCount(activeOrdersCount);
          
          const rawStaff = Array.isArray(staffRes?.data?.data) ? staffRes.data.data : Array.isArray(staffRes?.data) ? staffRes.data : [];
          setStaffCount(rawStaff.length);
        }
      } catch (err) {
        console.error('Error fetching sidebar counts:', err);
      }
    };

    fetchSidebarCounts();
    const interval = setInterval(fetchSidebarCounts, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const navItems = [
    { icon: LayoutDashboard, label: t('navigation.dashboard'), path: '/', badge: null, roles: ['OWNER', 'MANAGER', 'ADMIN'] },
    { icon: ReceiptText,     label: t('navigation.orders'), path: '/orders', badge: ordersCount > 0 ? String(ordersCount) : null, roles: ['OWNER', 'MANAGER', 'STAFF', 'ADMIN'] },
    { icon: UtensilsCrossed, label: t('navigation.menu'), path: '/menu', badge: null, roles: ['OWNER', 'ADMIN'] },
    { icon: QrCode,          label: t('navigation.tables'), path: '/tables', badge: null, roles: ['OWNER', 'MANAGER', 'ADMIN'] },
    { icon: Users,           label: t('navigation.staff'), path: '/staff', badge: staffCount > 0 ? String(staffCount) : null, roles: ['OWNER', 'ADMIN'] },
    { icon: BarChart2,       label: t('navigation.analytics'), path: '/analytics', badge: null, roles: ['OWNER', 'MANAGER', 'ADMIN'] },
    { icon: Settings,        label: t('navigation.settings'), path: '/settings', badge: null, roles: ['OWNER', 'ADMIN'] },
  ];
  
  const filteredNavItems = navItems.filter(item => !user?.role || item.roles.includes(user.role));

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: t('auth.logout'),
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      confirmLabel: t('auth.logout'),
      cancelLabel: t('common.cancel'),
      type: 'warning',
    });

    if (isConfirmed) {
      logout();
      navigate('/login');
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Toggle Button */}
      <button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        title={isCollapsed ? t('common.expand') : t('common.collapse')}
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
            <span className="brand-sub">
              {user?.role === 'STAFF' ? 'Staff Workspace' : user?.role === 'MANAGER' ? 'Manager Workspace' : 'Owner Workspace'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {!isCollapsed && <p className="nav-section-label">{t('common.navigation')}</p>}
        {filteredNavItems.map(({ icon: Icon, label, path, badge }) => (
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
              {user?.restaurant?.name || t('common.myRestaurant')}
            </p>
            <div className="restaurant-status">
              <span className="status-dot" />
              {t('common.open')}
            </div>
          </div>
        </div>

        <button 
          className="btn-logout" 
          onClick={handleLogout}
          title={isCollapsed ? t('auth.logout') : ""}
        >
          <LogOut size={17} />
          <span className="nav-label">{t('auth.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
