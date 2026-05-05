'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, Timestamp, addDoc, deleteDoc, doc, updateDoc, orderBy, limit, getDocs } from 'firebase/firestore';
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
  userId?: string;
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

    // Clean up expired notifications (older than 48 hours)
    const cleanupExpiredNotifications = async () => {
      const fortyEightHoursAgo = new Date();
      fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);
      
      try {
        const expiredQuery = query(
          collection(db, 'userNotifications'),
          where('userId', '==', user.uid),
          where('createdAt', '<', Timestamp.fromDate(fortyEightHoursAgo))
        );
        
        const expiredSnapshot = await getDocs(expiredQuery);
        const deletePromises = expiredSnapshot.docs.map(doc => 
          deleteDoc(doc.ref)
        );
        
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
          console.log(`🗑️ Deleted ${deletePromises.length} expired notifications (>48 hours old)`);
        }
      } catch (error) {
        console.error('❌ Error cleaning up expired notifications:', error);
      }
    };

    // Run cleanup on mount and every hour
    cleanupExpiredNotifications();
    const cleanupInterval = setInterval(cleanupExpiredNotifications, 60 * 60 * 1000); // Every hour

    // Listen to user's notifications from Firestore
    // Removed orderBy to avoid composite index requirement - will sort client-side
    const notificationsQuery = query(
      collection(db, 'userNotifications'),
      where('userId', '==', user.uid),
      limit(50)
    );

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const notifs: Notification[] = [];
      
      snapshot.forEach((doc) => {
        notifs.push({
          id: doc.id,
          ...doc.data(),
        } as Notification);
      });
      
      // Sort client-side by createdAt descending (newest first)
      notifs.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
      
      setNotifications(notifs);
    });

    // Listen to user's orders for status updates
    const ordersQuery = query(
      collection(db, 'orders'),
      where('customerEmail', '==', user.email)
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
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
            console.log('🔔 Order status changed:', data.status);
            console.log('📧 Sending notification:', statusInfo.title);
            
            // Save notification to Firestore
            try {
              await addDoc(collection(db, 'userNotifications'), {
                userId: user.uid,
                orderId: doc.id,
                title: statusInfo.title,
                message: statusInfo.message,
                type: 'order',
                status: data.status,
                createdAt: Timestamp.now(),
                read: false,
              });
              console.log('💾 Notification saved to Firestore');
            } catch (error) {
              console.error('❌ Error saving notification to Firestore:', error);
            }
            
            // Play notification sound
            playNotificationSound();
            
            // Send push notification if permission granted
            console.log('🔐 Permission status:', permission);
            if (permission === 'granted') {
              console.log('✅ Calling sendPushNotification...');
              sendPushNotification(statusInfo.title, {
                body: statusInfo.message,
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                tag: 'order-update',
                requireInteraction: false,
              });
            } else {
              console.warn('⚠️ Cannot send push notification - permission not granted');
            }
          }
        }
      });
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeOrders();
      clearInterval(cleanupInterval);
    };
  }, [user?.email, user?.uid, permission, sendPushNotification]);

  const playNotificationSound = () => {
    const audio = new Audio('/Notification.mp3');
    audio.volume = 0.6;
    audio.play().catch(error => {
      console.log('Notification audio playback failed:', error);
    });
  };

  const markAsRead = async (id: string) => {
    try {
      // Update in Firestore
      await updateDoc(doc(db, 'userNotifications', id), {
        read: true,
      });
      console.log('✅ Notification marked as read:', id);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      // Delete all notifications for this user from Firestore
      const deletePromises = notifications.map(notif => 
        deleteDoc(doc(db, 'userNotifications', notif.id))
      );
      await Promise.all(deletePromises);
      console.log('✅ All notifications cleared from Firestore');
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
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
