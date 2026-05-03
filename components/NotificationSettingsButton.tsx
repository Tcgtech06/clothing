'use client';

import { Bell, BellOff, BellRing } from 'lucide-react';
import { usePushNotifications } from '@/lib/push-notification-context';

export default function NotificationSettingsButton() {
  const { permission, requestPermission, isSupported } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const handleClick = async () => {
    if (permission === 'default') {
      await requestPermission();
    } else if (permission === 'denied') {
      alert('Notifications are blocked. To enable:\n\n1. Click the lock icon in your browser address bar\n2. Find "Notifications" setting\n3. Change to "Allow"');
    } else {
      // Already granted - show info
      alert('Push notifications are enabled! You will receive alerts for order updates.');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 hover:bg-gray-100 rounded-full transition"
      title={
        permission === 'granted'
          ? 'Notifications enabled'
          : permission === 'denied'
          ? 'Notifications blocked - click to learn how to enable'
          : 'Enable notifications'
      }
    >
      {permission === 'granted' ? (
        <BellRing className="w-6 h-6 text-green-600" />
      ) : permission === 'denied' ? (
        <BellOff className="w-6 h-6 text-red-600" />
      ) : (
        <Bell className="w-6 h-6 text-gray-600" />
      )}
      
      {permission === 'default' && (
        <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
      )}
    </button>
  );
}
