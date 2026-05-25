'use client';

import './globals.css';
import Navigation from '@/components/Navigation';
import { CartProvider } from '@/lib/cart-context';
import { FavouritesProvider } from '@/lib/favourites-context';
import { AuthProvider } from '@/lib/auth-context';
import { AdminAuthProvider } from '@/lib/admin-auth-context';
import { PushNotificationProvider } from '@/lib/push-notification-context';
import { NotificationProvider } from '@/lib/notification-context';
import NotificationPermissionPrompt from '@/components/NotificationPermissionPrompt';
import { useFCMToken } from '@/lib/use-fcm-token';

function FCMTokenManager() {
  useFCMToken();
  return null;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>LASRO - Premium Fashion</title>
        <meta name="description" content="LASRO - Your Premium Fashion Destination" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C49A8A" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gradient-to-b from-rose-50 via-rose-100 to-rose-50">
        <AdminAuthProvider>
          <AuthProvider>
            <PushNotificationProvider>
              <NotificationProvider>
                <CartProvider>
                  <FavouritesProvider>
                    <Navigation />
                    <NotificationPermissionPrompt />
                    <FCMTokenManager />
                    <main className="pt-14 pb-20 md:pt-0 md:pb-0">{children}</main>
                  </FavouritesProvider>
                </CartProvider>
              </NotificationProvider>
            </PushNotificationProvider>
          </AuthProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
