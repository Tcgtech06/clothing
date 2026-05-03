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
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if browser supports notifications and service workers
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
      console.log('🔔 Push Notification System Initialized');
      console.log('📱 Browser supports notifications:', true);
      console.log('🔐 Current permission:', Notification.permission);
      
      // Register service worker
      registerServiceWorker();
    } else {
      console.warn('⚠️ Push notifications not supported in this browser');
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service Worker registered:', reg);
      setRegistration(reg);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('Service Worker ready');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

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
    console.log('🔔 sendNotification called:', title);
    console.log('📊 isSupported:', isSupported, 'permission:', permission);
    console.log('👁️ Page visible:', !document.hidden);
    
    if (!isSupported) {
      console.warn('⚠️ Push notifications not supported');
      return;
    }

    if (permission !== 'granted') {
      console.warn('⚠️ Push notification permission not granted. Current:', permission);
      return;
    }

    try {
      // Play notification sound
      const audio = new Audio('/Notification.mp3');
      audio.volume = 0.6;
      audio.play().catch(err => console.log('🔇 Audio play failed:', err));

      // ONLY send push notification if page is hidden (user closed the webapp)
      if (document.hidden && registration) {
        // Send notification through service worker for background notifications
        registration.showNotification(title, {
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          requireInteraction: false,
          ...options,
        });
        console.log('✅ Background push notification sent via Service Worker (page hidden):', title);
      } else {
        // Page is visible - notification will show in-app only (notification bell)
        console.log('📱 In-app notification only (page visible):', title);
        // Don't create browser notification when page is visible
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error);
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
