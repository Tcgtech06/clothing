'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { useAuth } from './auth-context';
import { usePushNotifications } from './push-notification-context';

interface Notification {
  id: string;
  orderId: string;
  title: string;
  message: string;
  type: 'order' | 'return' | 'product' | 'info';
  status?: string;
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
  const { user } = useAuth();
  const { sendNotification: sendPushNotification, permission } = usePushNotifications();

  useEffect(() => {
    if (!user?.email) return;

    // Listen to user's orders for status updates
    // Simplified query to avoid composite index requirement
    const ordersQuery = query(
      collection(db, 'orders'),
      where('customerEmail', '==', user.email)
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const doc = change.doc;
        const data = doc.data();
        
        // Only show notifications for status updates (not new orders)
        if (change.type === 'modified') {
          const statusMessages: { [key: string]: { title: string; message: string; emoji: string } } = {
            'accepted': {
              title: '✅ Order Accepted by Admin',
              message: `Your order #${doc.id.substring(0, 8).toUpperCase()} has been accepted and is being prepared`,
              emoji: '✅'
            },
            'processing': {
              title: '⚙️ Order Processing',
              message: `Your order #${doc.id.substring(0, 8).toUpperCase()} is being processed`,
              emoji: '⚙️'
            },
            'shipped': {
              title: '🚚 Order Shipped',
              message: `Your order #${doc.id.substring(0, 8).toUpperCase()} has been shipped and is on the way`,
              emoji: '🚚'
            },
            'nearby': {
              title: '📍 Order Nearby',
              message: `Your order #${doc.id.substring(0, 8).toUpperCase()} is nearby for delivery`,
              emoji: '📍'
            },
            'out-for-delivery': {
              title: '🚛 Out for Delivery',
              message: `Your order #${doc.id.substring(0, 8).toUpperCase()} is out for delivery`,
              emoji: '🚛'
            },
            'delivered': {
              title: '✅ Order Delivered',
              message: `Your order #${doc.id.substring(0, 8).toUpperCase()} has been delivered successfully`,
              emoji: '🎉'
            },
          };
          
          const statusInfo = statusMessages[data.status];
          
          if (statusInfo) {
            // Play notification sound
            playNotificationSound();
            
            // Send push notification if permission granted
            if (permission === 'granted') {
              sendPushNotification(statusInfo.title, {
                body: statusInfo.message,
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                tag: 'order-update',
                requireInteraction: false,
                vibrate: [200, 100, 200],
              });
            }
            
            // Add notification
            setNotifications(prev => {
              const newNotification: Notification = {
                id: `${doc.id}-${data.status}-${Date.now()}`,
                orderId: doc.id,
                title: statusInfo.title,
                message: statusInfo.message,
                type: 'order',
                status: data.status,
                createdAt: Timestamp.now(),
                read: false,
              };
              
              // Add to beginning and keep last 20
              const updated = [newNotification, ...prev].slice(0, 20);
              // Sort by timestamp (newest first)
              return updated.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user?.email, permission, sendPushNotification]);

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
