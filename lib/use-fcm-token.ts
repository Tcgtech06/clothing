import { useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './auth-context';

export function useFCMToken() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.email || !user?.uid) return;

    const storeFCMToken = async () => {
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
          // Store FCM token in Firestore
          await setDoc(doc(db, 'userFCMTokens', user.email!), {
            token: subscription.endpoint,
            subscription: subscription.toJSON(),
            userId: user.uid,
            userEmail: user.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });

          console.log('✅ FCM token stored in Firestore for user:', user.email);
        }
      } catch (error) {
        console.error('❌ Error storing FCM token:', error);
      }
    };

    // Store token when user logs in
    storeFCMToken();
  }, [user?.email, user?.uid]);
}
