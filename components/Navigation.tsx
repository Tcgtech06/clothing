'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Package, User, ShoppingCart, Heart, Headphones } from 'lucide-react';
import { useState } from 'react';
import ProfileMenu from './ProfileMenu';
import { useCart } from '@/lib/cart-context';
import { useFavourites } from '@/lib/favourites-context';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Explore', href: '/category', icon: Grid },
  { name: 'My Orders', href: '/orders', icon: Package },
  { name: 'Support', href: '/support', icon: Headphones },
];

export default function Navigation() {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const { getCartCount } = useCart();
  const { getFavouritesCount } = useFavourites();
  const { user, userData, logout } = useAuth();
  const cartCount = getCartCount();
  const favouritesCount = getFavouritesCount();

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
  };

  const displayName = userData?.displayName || user?.displayName || 'User';
  const displayEmail = userData?.email || user?.email || 'user@example.com';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Profile Slide-in Menu */}
      <ProfileMenu isOpen={showMobileProfile} onClose={() => setShowMobileProfile(false)} />

      {/* Mobile Navigation - Top Bar with Profile */}
      <nav className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-40">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Profile Icon - Left Side */}
          <button
            onClick={() => setShowMobileProfile(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white hover:shadow-lg transition"
          >
            <User className="w-6 h-6" />
          </button>

          {/* Logo - Center */}
          <Link href="/" className="text-xl font-bold text-primary">
            E-Shop
          </Link>

          {/* Right Side Icons */}
          <div className="flex items-center gap-3">
            {/* Favourites Icon */}
            <Link href="/favourites" className="relative">
              <Heart className={`w-6 h-6 ${pathname === '/favourites' ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
              {favouritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {favouritesCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Desktop/Tablet Navigation - Header */}
      <nav className="hidden md:block bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary">
                E-Shop
              </Link>
            </div>
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Right Side Icons */}
            <div className="flex items-center gap-4">
              {/* Profile Icon */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white hover:shadow-lg transition"
                >
                  <User className="w-5 h-5" />
                </button>
                
                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <>
                    {/* Overlay for desktop */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    
                    <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-64 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="font-semibold text-gray-800">{displayName}</p>
                        <p className="text-sm text-gray-500">{displayEmail}</p>
                      </div>
                      
                      {/* Menu Items */}
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        My Profile
                      </Link>
                      
                      <hr className="my-2" />
                      
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Favourites Icon */}
              <Link href="/favourites" className="relative">
                <Heart className={`w-6 h-6 hover:text-red-500 transition ${pathname === '/favourites' ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                {favouritesCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {favouritesCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon - Far Right */}
              <Link href="/cart" className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-primary transition" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition ${
                  isActive ? 'text-primary' : 'text-gray-600'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
