'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Package, RotateCcw } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, Timestamp, addDoc, deleteDoc, doc, updateDoc, where, getDocs } from 'firebase/firestore';
import { usePushNotifications } from '@/lib/push-notification-context';

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'return';
  createdAt: Timestamp;
  read: boolean;
  adminId?: string;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [lastReturnCount, setLastReturnCount] = useState(0);
  const { sendNotification: sendPushNotification, permission } = usePushNotifications();

  useEffect(() => {
    // Clean up expired admin notifications (older than 48 hours) - simplified to avoid index requirement
    const cleanupExpiredNotifications = async () => {
      try {
        // Get all admin notifications
        const allNotificationsQuery = query(
          collection(db, 'adminNotifications')
        );
        
        const snapshot = await getDocs(allNotificationsQuery);
        const fortyEightHoursAgo = Date.now() - (48 * 60 * 60 * 1000);
        
        // Filter and delete expired ones client-side
        const deletePromises = snapshot.docs
          .filter(doc => {
            const createdAt = doc.data().createdAt?.toMillis() || 0;
            return createdAt < fortyEightHoursAgo;
          })
          .map(doc => deleteDoc(doc.ref));
        
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
          console.log(`🗑️ Deleted ${deletePromises.length} expired admin notifications (>48 hours old)`);
        }
      } catch (error) {
        console.error('❌ Error cleaning up expired admin notifications:', error);
      }
    };

    // Run cleanup on mount and every hour
    cleanupExpiredNotifications();
    const cleanupInterval = setInterval(cleanupExpiredNotifications, 60 * 60 * 1000); // Every hour

    // Listen to admin notifications from Firestore
    // Removed orderBy to avoid composite index requirement - will sort client-side
    const adminNotificationsQuery = query(
      collection(db, 'adminNotifications'),
      limit(50)
    );

    const unsubscribeAdminNotifications = onSnapshot(adminNotificationsQuery, (snapshot) => {
      const notifs: AdminNotification[] = [];
      
      snapshot.forEach((doc) => {
        notifs.push({
          id: doc.id,
          ...doc.data(),
        } as AdminNotification);
      });
      
      // Sort client-side by createdAt descending (newest first)
      notifs.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
      
      setNotifications(notifs);
    });
    // Listen to new orders ONLY (not status updates)
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const doc = change.doc;
        const data = doc.data();
        const orderDate = data.createdAt?.toDate();
        const now = new Date();
        const diffMinutes = orderDate ? (now.getTime() - orderDate.getTime()) / (1000 * 60) : 999;
        
        // Show notifications ONLY for NEW orders (not status updates)
        if (diffMinutes < 60 && change.type === 'added') {
          const notificationData = {
            title: '🛍️ New Order Received',
            message: `Order #${doc.id.substring(0, 8).toUpperCase()} - ₹${data.total} from ${data.customerName}`,
            type: 'order' as const,
            createdAt: data.createdAt,
            read: false,
          };
          
          console.log('🔔 New order detected:', doc.id);
          console.log('📧 Sending admin notification:', notificationData.title);
          
          // Save notification to Firestore
          try {
            await addDoc(collection(db, 'adminNotifications'), notificationData);
            console.log('💾 Admin notification saved to Firestore');
          } catch (error) {
            console.error('❌ Error saving admin notification:', error);
          }
          
          // Play notification sound
          playNotificationSound();
          
          // Send push notification for new order
          console.log('🔐 Admin permission status:', permission);
          if (permission === 'granted') {
            console.log('✅ Calling sendPushNotification for admin...');
            sendPushNotification(notificationData.title, {
              body: notificationData.message,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              tag: 'admin-order',
              requireInteraction: true,
            });
          } else {
            console.warn('⚠️ Cannot send admin push notification - permission not granted');
          }
        }
      });
    });

    // Listen to return requests
    const returnsQuery = query(
      collection(db, 'returnRequests'),
      orderBy('requestedAt', 'desc'),
      limit(20)
    );

    const unsubscribeReturns = onSnapshot(returnsQuery, (snapshot) => {
      snapshot.forEach(async (docSnapshot) => {
        const data = docSnapshot.data();
        const returnDate = data.requestedAt?.toDate();
        const now = new Date();
        const diffMinutes = (now.getTime() - returnDate?.getTime()) / (1000 * 60);
        
        // Show notifications for returns requested in the last 60 minutes
        if (diffMinutes < 60 && data.status === 'pending') {
          const notificationData = {
            title: '🔄 Return Request',
            message: `Return for Order #${data.orderId?.substring(0, 8).toUpperCase()} - ₹${data.total}`,
            type: 'return' as const,
            createdAt: data.requestedAt,
            read: false,
          };
          
          // Check if notification already exists
          const existingNotif = notifications.find(n => 
            n.type === 'return' && n.message.includes(data.orderId?.substring(0, 8).toUpperCase())
          );
          
          if (!existingNotif) {
            // Save notification to Firestore
            try {
              await addDoc(collection(db, 'adminNotifications'), notificationData);
              console.log('💾 Return notification saved to Firestore');
              
              // Play notification sound
              playNotificationSound();
              
              // Send push notification
              if (permission === 'granted') {
                sendPushNotification(notificationData.title, {
                  body: notificationData.message,
                  icon: '/icon-192x192.png',
                  badge: '/icon-192x192.png',
                  tag: 'admin-order',
                  requireInteraction: true,
                });
              }
            } catch (error) {
              console.error('❌ Error saving return notification:', error);
            }
          }
        }
      });
    });

    return () => {
      unsubscribeAdminNotifications();
      unsubscribeOrders();
      unsubscribeReturns();
      clearInterval(cleanupInterval);
    };
  }, [lastOrderCount, lastReturnCount, permission, sendPushNotification, notifications]);

  const playNotificationSound = () => {
    const audio = new Audio('/Notification.mp3');
    audio.volume = 0.7;
    audio.play().catch(error => {
      console.log('Admin notification audio playback failed:', error);
    });
  };

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'adminNotifications', id), {
        read: true,
      });
      console.log('✅ Admin notification marked as read:', id);
    } catch (error) {
      console.error('❌ Error marking admin notification as read:', error);
    }
  };

  const clearAll = async () => {
    if (notifications.length === 0) {
      console.log('⚠️ No notifications to clear');
      return;
    }

    try {
      console.log(`🗑️ Attempting to delete ${notifications.length} admin notifications...`);
      
      const deletePromises = notifications.map(notif => {
        console.log('Deleting notification:', notif.id);
        return deleteDoc(doc(db, 'adminNotifications', notif.id));
      });
      
      await Promise.all(deletePromises);
      console.log('✅ All admin notifications cleared from Firebase');
      
      // Close the dropdown after clearing
      setShowNotifications(false);
    } catch (error: any) {
      console.error('❌ Error clearing admin notifications:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      alert(`Failed to clear notifications: ${error.message}`);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
      >
        <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowNotifications(false)}
          />

          {/* Notification Panel */}
          <div className="absolute top-12 right-0 bg-white rounded-lg shadow-2xl border border-gray-200 w-96 z-50 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50">
              <div>
                <h3 className="font-bold text-gray-800">Admin Notifications</h3>
                <p className="text-xs text-gray-500">{unreadCount} unread</p>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                        !notification.read ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {notification.type === 'order' ? (
                            <Package className="w-5 h-5 text-blue-600" />
                          ) : (
                            <RotateCcw className="w-5 h-5 text-orange-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm text-gray-800">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1 animate-pulse"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-full text-center text-sm text-primary hover:text-primary/80 font-semibold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
