'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PushNotificationContextType {
  permission: NotificationPermission;
  requestPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  isSupported: boolean;
}

const PushNotificationContext = createContext<PushNotificationContextType>({
  permission: 'default',
  requestPermission: async () => false,
  sendNotification: () => {},
  isSupported: false,
});

export const usePushNotifications = () => useContext(PushNotificationContext);

export function PushNotificationProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        console.log('Push notification permission granted');
        // Show a welcome notification
        sendNotification('Notifications Enabled! 🔔', {
          body: 'You will now receive order updates and notifications',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
        });
        return true;
      } else {
        console.log('Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported) {
      console.log('Push notifications not supported');
      return;
    }

    if (permission !== 'granted') {
      console.log('Push notification permission not granted');
      return;
    }

    try {
      // Play notification sound
      const audio = new Audio('/Notification.mp3');
      audio.volume = 0.6;
      audio.play().catch(err => console.log('Audio play failed:', err));

      // Create notification
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        requireInteraction: false,
        ...options,
      });

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navigate to orders page if notification has tag
        if (options?.tag === 'order-update') {
          window.location.href = '/orders';
        } else if (options?.tag === 'admin-order') {
          window.location.href = '/admin-dashboard-secret';
        }
      };

      console.log('Push notification sent:', title);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return (
    <PushNotificationContext.Provider
      value={{
        permission,
        requestPermission,
        sendNotification,
        isSupported,
      }}
    >
      {children}
    </PushNotificationContext.Provider>
  );
}
