'use client';

import './globals.css';
import Navigation from '@/components/Navigation';
import { CartProvider } from '@/lib/cart-context';
import { FavouritesProvider } from '@/lib/favourites-context';
import { AuthProvider } from '@/lib/auth-context';
import { AdminAuthProvider } from '@/lib/admin-auth-context';
import { NotificationProvider } from '@/lib/notification-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>E-Commerce PWA</title>
        <meta name="description" content="Progressive Web App E-Commerce Store" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="bg-gray-50">
        <AdminAuthProvider>
          <AuthProvider>
            <NotificationProvider>
              <CartProvider>
                <FavouritesProvider>
                  <Navigation />
                  <main className="pt-14 pb-20 md:pt-0 md:pb-0">{children}</main>
                </FavouritesProvider>
              </CartProvider>
            </NotificationProvider>
          </AuthProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
