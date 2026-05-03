'use client';

import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/lib/push-notification-context';

export default function AdminNotificationPermission() {
  const { permission, requestPermission, isSupported } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    if (permission === 'default') {
      await requestPermission();
    } else if (permission === 'denied') {
      alert('Notifications are blocked. Please enable them in your browser settings.');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
        permission === 'granted'
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : permission === 'denied'
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      }`}
      title={
        permission === 'granted'
          ? 'Push notifications enabled'
          : permission === 'denied'
          ? 'Push notifications blocked'
          : 'Enable push notifications'
      }
    >
      {permission === 'granted' ? (
        <>
          <Bell className="w-4 h-4" />
          <span className="hidden md:inline">Notifications On</span>
        </>
      ) : (
        <>
          <BellOff className="w-4 h-4" />
          <span className="hidden md:inline">
            {permission === 'denied' ? 'Blocked' : 'Enable Alerts'}
          </span>
        </>
      )}
    </button>
  );
}
