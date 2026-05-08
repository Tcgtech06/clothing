'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Package, User, ShoppingCart, Heart, Headphones } from 'lucide-react';
import { useState } from 'react';
import ProfileMenu from './ProfileMenu';
import NotificationBell from './NotificationBell';
import { useCart } from '@/lib/cart-context';
import { useFavourites } from '@/lib/favourites-context';
import { useAuth } from '@/lib/auth-context';

// Gender Icons - Realistic and Professional
const MaleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <circle cx="32" cy="16" r="10" fill="#3B82F6"/>
    {/* Neck */}
    <rect x="28" y="24" width="8" height="4" fill="#2563EB" rx="2"/>
    {/* Shoulders and torso */}
    <path d="M20 28 L20 32 Q20 34 22 34 L22 50 Q22 52 24 52 L28 52 L28 62 L36 62 L36 52 L40 52 Q42 52 42 50 L42 34 Q44 34 44 32 L44 28 Q44 28 42 28 L38 28 L38 32 L26 32 L26 28 L22 28 Q20 28 20 28 Z" fill="#60A5FA"/>
    {/* Arms */}
    <rect x="16" y="30" width="6" height="18" fill="#3B82F6" rx="3"/>
    <rect x="42" y="30" width="6" height="18" fill="#3B82F6" rx="3"/>
  </svg>
);

const FemaleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <circle cx="32" cy="16" r="10" fill="#EC4899"/>
    {/* Hair */}
    <path d="M22 12 Q22 8 26 8 Q28 6 32 6 Q36 6 38 8 Q42 8 42 12 L42 18 Q42 20 40 20 L24 20 Q22 20 22 18 Z" fill="#BE185D"/>
    {/* Neck */}
    <rect x="28" y="24" width="8" height="4" fill="#DB2777" rx="2"/>
    {/* Dress/Body */}
    <path d="M24 28 L24 32 Q24 34 26 34 L26 50 Q26 52 28 52 L28 62 L36 62 L36 52 Q38 52 38 50 L38 34 Q40 34 40 32 L40 28 Q40 28 38 30 L36 32 L36 48 L28 48 L28 32 L26 30 Q24 28 24 28 Z" fill="#F472B6"/>
    {/* Dress skirt */}
    <path d="M26 48 L22 58 Q22 60 24 60 L40 60 Q42 60 42 58 L38 48 Z" fill="#FBCFE8"/>
  </svg>
);

const TransgenderIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Head */}
    <circle cx="32" cy="16" r="10" fill="#8B5CF6"/>
    {/* Neck */}
    <rect x="28" y="24" width="8" height="4" fill="#7C3AED" rx="2"/>
    {/* Body - Neutral style */}
    <path d="M22 28 L22 32 Q22 34 24 34 L24 50 Q24 52 26 52 L28 52 L28 62 L36 62 L36 52 L38 52 Q40 52 40 50 L40 34 Q42 34 42 32 L42 28 Q42 28 40 28 L38 28 L38 48 L26 48 L26 28 L24 28 Q22 28 22 28 Z" fill="#A78BFA"/>
    {/* Transgender symbol overlay */}
    <circle cx="48" cy="48" r="8" fill="#FFFFFF" opacity="0.9"/>
    <path d="M48 44 L48 52 M44 48 L52 48 M46 46 L50 50 M50 46 L46 50" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

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
          {/* Left Side - Profile */}
          <div className="flex items-center gap-2">
            {/* Profile Icon */}
            <button
              onClick={() => setShowMobileProfile(true)}
              className="w-10 h-10 rounded-full bg-white border-2 border-primary flex items-center justify-center hover:shadow-lg transition"
            >
              {userData?.gender === 'male' ? (
                <MaleIcon className="w-8 h-8" />
              ) : userData?.gender === 'female' ? (
                <FemaleIcon className="w-8 h-8" />
              ) : userData?.gender === 'transgender' ? (
                <TransgenderIcon className="w-8 h-8" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white">
                  <User className="w-6 h-6" />
                </div>
              )}
            </button>
          </div>

          {/* Logo - Center */}
          <Link href="/" className="text-xl font-bold text-primary">
            E-Shop
          </Link>

          {/* Right Side Icons */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationBell />
            
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
              {/* Notification Bell */}
              <NotificationBell />

              {/* Profile Icon */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full bg-white border-2 border-primary flex items-center justify-center hover:shadow-lg transition"
                >
                  {userData?.gender === 'male' ? (
                    <MaleIcon className="w-8 h-8" />
                  ) : userData?.gender === 'female' ? (
                    <FemaleIcon className="w-8 h-8" />
                  ) : userData?.gender === 'transgender' ? (
                    <TransgenderIcon className="w-8 h-8" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </button>
                
                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <>
                    {/* Overlay for desktop */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    
                    {user ? (
                      // Logged in user dropdown
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
                    ) : (
                      // Not logged in dropdown
                      <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-64 z-50">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="font-semibold text-gray-800">Welcome!</p>
                          <p className="text-sm text-gray-500">Please login to continue</p>
                        </div>
                        
                        <Link
                          href="/login"
                          className="block px-4 py-2 text-primary hover:bg-primary/5 font-medium"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Login
                        </Link>
                        
                        <Link
                          href="/signup"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          Sign Up
                        </Link>
                      </div>
                    )}
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
