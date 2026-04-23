import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, ChevronDown, CheckCheck, Trash2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, subtitle }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { notifications, unreadCount, markAllAsRead, markAsRead, clearAll } = useNotification();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatNotifTime = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `Il y a ${diff} min`;
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)} h`;
    return date.toLocaleDateString();
  };

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
                placeholder={t('common.search')}
                aria-label={t('common.search')}
              />
            </div>

            {/* Notifications */}
            <div className="notif-wrapper" ref={notifRef} style={{ position: 'relative' }}>
              <button 
                className="icon-btn" 
                aria-label={t('common.notifications')}
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <Bell size={17} />
                {unreadCount > 0 && <span className="notif-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>

              {isNotifOpen && (
                <div style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  marginTop: 8,
                  width: 380,
                  background: 'var(--surface-0, #fff)',
                  borderRadius: 16,
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border)',
                  zIndex: 9999,
                  overflow: 'hidden',
                  animation: 'slideUp 0.2s ease forwards'
                }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-50)' }}>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: 'var(--text-900)' }}>Notifications</h4>
                    {notifications.length > 0 && (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-ghost btn-xs" onClick={markAllAsRead} title="Tout marquer comme lu" style={{ color: 'var(--text-600)', padding: 4 }}><CheckCheck size={16} /></button>
                        <button className="btn btn-ghost btn-xs" onClick={clearAll} title="Tout effacer" style={{ color: 'var(--danger-600)', padding: 4 }}><Trash2 size={16} /></button>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-400)', fontSize: 14 }}>
                        <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                        <p>Aucune notification pour le moment.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          style={{ 
                            padding: '16px 20px', 
                            borderBottom: '1px solid var(--border)',
                            background: n.isRead ? 'transparent' : 'var(--brand-50, rgba(235, 96, 12, 0.05))',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: 16,
                            transition: 'background 0.2s',
                            position: 'relative'
                          }}
                          onClick={() => markAsRead(n.id)}
                        >
                          {!n.isRead && (
                             <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--brand-500, #eb600c)' }} />
                          )}
                          <div style={{ 
                            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                            background: n.type === 'NEW_ORDER' ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                            color: n.type === 'NEW_ORDER' ? '#10b981' : '#6366f1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18
                          }}>
                            {n.type === 'NEW_ORDER' ? '🔔' : '🔄'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                              <strong style={{ fontSize: 14, color: 'var(--text-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</strong>
                              <span style={{ fontSize: 12, color: 'var(--text-400)', flexShrink: 0, marginLeft: 8 }}>{formatNotifTime(n.timestamp)}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-600)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="topbar-divider" aria-hidden="true" />

            {/* User pill */}
            <div className="user-pill" role="button" tabIndex={0} aria-label={t('common.userMenu')}>
              <div className="user-avatar">
              {user?.name 
                ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() 
                : user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-meta">
              <p className="user-name">{user?.name || user?.email?.split('@')[0] || t('common.user')}</p>
              <p className="user-role">{user?.role === 'OWNER' ? t('staff.roles.owner') : t('common.member')}</p>
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
