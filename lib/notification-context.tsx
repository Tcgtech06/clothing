'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'return' | 'product' | 'info';
  createdAt: Timestamp;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  clearAll: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  useEffect(() => {
    // Listen to new orders for notifications
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const newNotifications: Notification[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const orderDate = data.createdAt?.toDate();
        const now = new Date();
        const diffMinutes = (now.getTime() - orderDate?.getTime()) / (1000 * 60);
        
        // Only show notifications for orders placed in the last 30 minutes
        if (diffMinutes < 30) {
          newNotifications.push({
            id: doc.id,
            title: 'New Order Received',
            message: `Order #${doc.id.substring(0, 8).toUpperCase()} - ₹${data.total}`,
            type: 'order',
            createdAt: data.createdAt,
            read: false,
          });
        }
      });

      // Play notification sound if there are new notifications
      if (newNotifications.length > lastNotificationCount && lastNotificationCount > 0) {
        playNotificationSound();
      }
      
      setLastNotificationCount(newNotifications.length);
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [lastNotificationCount]);

  const playNotificationSound = () => {
    const audio = new Audio('/Notification.mp3');
    audio.volume = 0.6;
    audio.play().catch(error => {
      console.log('Notification audio playback failed:', error);
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
