import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';

export type NotificationType = 'NEW_ORDER' | 'STATUS_UPDATE' | 'INFO';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  metadata?: any;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!isAuthenticated || !user?.restaurant?.id) {
       if (socket) {
          socket.disconnect();
          setSocket(null);
       }
       return;
    }

    // Determine the base URL dynamically just like api.ts
    const getWsUrl = () => {
      if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace('/api/v1', '');
      }
      return `http://${window.location.hostname}:3000`;
    };

    const newSocket = io(getWsUrl(), {
       transports: ['websocket'],
       reconnection: true,
       reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
       console.log('💡 WebSocket Connected to NotificationsGateway');
       newSocket.emit('joinRestaurant', user.restaurant!.id);
    });

    newSocket.on('newOrder', (order: any) => {
       const newNotif: AppNotification = {
          id: Date.now().toString() + Math.random().toString(),
          type: 'NEW_ORDER',
          title: 'Nouvelle Commande',
          message: `La table ${order?.table?.number || 'inconnue'} a passé une commande !`,
          timestamp: new Date(),
          isRead: false,
          metadata: order
       };
       setNotifications(prev => [newNotif, ...prev]);
       addToast({
         type: 'success',
         title: '🌟 Nouvelle Commande',
         message: newNotif.message
       });
    });

    newSocket.on('orderStatusUpdated', (data: any) => {
       const newNotif: AppNotification = {
          id: Date.now().toString() + Math.random().toString(),
          type: 'STATUS_UPDATE',
          title: 'Statut mis à jour',
          message: `La commande ${data.orderId ? '#' + data.orderId.substring(0, 5) : ''} est passée en: ${data.status}`,
          timestamp: new Date(),
          isRead: false,
          metadata: data
       };
       setNotifications(prev => [newNotif, ...prev]);
       addToast({
         type: 'info',
         title: '🔄 Mise à jour',
         message: newNotif.message
       });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, isAuthenticated]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
