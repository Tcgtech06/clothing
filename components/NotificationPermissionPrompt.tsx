'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '@/lib/push-notification-context';

export default function NotificationPermissionPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { permission, requestPermission, isSupported } = usePushNotifications();

  useEffect(() => {
    // Show prompt after 3 seconds if permission is default and notifications are supported
    if (isSupported && permission === 'default') {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [permission, isSupported]);

  const handleAllow = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowPrompt(false);
      // Save preference
      localStorage.setItem('notificationPromptShown', 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Save that user dismissed (don't show again for 7 days)
    const dismissedUntil = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('notificationPromptDismissed', dismissedUntil.toString());
  };

  // Don't show if already dismissed recently
  useEffect(() => {
    const dismissedUntil = localStorage.getItem('notificationPromptDismissed');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil)) {
      setShowPrompt(false);
    }
  }, []);

  if (!showPrompt || !isSupported || permission !== 'default') {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in" />

      {/* Prompt Card */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 animate-slide-up">
        <div className="bg-white rounded-2xl shadow-2xl p-6 relative">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center animate-pulse">
              <Bell className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Stay Updated! 🔔
          </h3>
          <p className="text-center text-gray-600 mb-6">
            Get instant notifications about your order status, special offers, and important updates
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="text-sm text-gray-700">Real-time order status updates</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="text-sm text-gray-700">Delivery notifications with sound alerts</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="text-sm text-gray-700">Never miss important updates</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAllow}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              Allow Notifications
            </button>
            <button
              onClick={handleDismiss}
              className="w-full text-gray-600 py-2 rounded-xl font-medium hover:bg-gray-100 transition"
            >
              Maybe Later
            </button>
          </div>

          {/* Privacy note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            You can change this anytime in your browser settings
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
