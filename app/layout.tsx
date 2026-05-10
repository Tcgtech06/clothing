'use client';

import './globals.css';
import Navigation from '@/components/Navigation';
import SplashScreen from '@/components/SplashScreen';
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
        <title>LE WORE - Premium Fashion</title>
        <meta name="description" content="LE WORE - Premium Fashion E-Commerce Store" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/logo1.jpg" />
        <link rel="apple-touch-icon" href="/logo1.jpg" />
      </head>
      <body className="bg-gray-50">
        <SplashScreen />
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
