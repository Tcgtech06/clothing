import { useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useAdminAuth } from './admin-auth-context';

export function useAdminFCMToken() {
  const { isAdminAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (!isAdminAuthenticated) return;

    const storeAdminFCMToken = async () => {
      try {
        // Check if service worker is registered
        if (!('serviceWorker' in navigator)) {
          console.log('Service Worker not supported');
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        
        // Check if we have VAPID key
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
        if (!vapidKey) {
          console.warn('⚠️ VAPID key not configured. Add NEXT_PUBLIC_VAPID_KEY to .env.local');
          console.warn('⚠️ Get VAPID key from: Firebase Console → Project Settings → Cloud Messaging → Web Push certificates');
          return;
        }

        // Check if notification permission is granted
        if (Notification.permission !== 'granted') {
          console.log('Notification permission not granted yet');
          return;
        }

        // Get or create push subscription
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidKey
          });
        }

        if (subscription) {
          const tokenEndpoint = subscription.endpoint;
          
          // Check if this token already exists
          const tokensRef = collection(db, 'adminFCMTokens');
          const q = query(tokensRef, where('token', '==', tokenEndpoint));
          const existingTokens = await getDocs(q);
          
          if (existingTokens.empty) {
            // Store new admin FCM token in Firestore
            await addDoc(collection(db, 'adminFCMTokens'), {
              token: tokenEndpoint,
              subscription: subscription.toJSON(),
              adminUsername: sessionStorage.getItem('adminUsername') || 'admin',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });

            console.log('✅ Admin FCM token stored in Firestore');
          } else {
            console.log('✅ Admin FCM token already exists');
          }
        }
      } catch (error) {
        console.error('❌ Error storing admin FCM token:', error);
      }
    };

    // Store token when admin logs in
    storeAdminFCMToken();
  }, [isAdminAuthenticated]);
}
