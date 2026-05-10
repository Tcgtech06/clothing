'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Package, User, ShoppingCart, Heart, Headphones } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import ProfileMenu from './ProfileMenu';
import NotificationBell from './NotificationBell';
import { useCart } from '@/lib/cart-context';
import { useFavourites } from '@/lib/favourites-context';
import { useAuth } from '@/lib/auth-context';

// Gender Icons - Realistic Avatar Style
const MaleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background circle */}
    <circle cx="50" cy="50" r="50" fill="#E8F4F8"/>
    {/* Face */}
    <circle cx="50" cy="40" r="18" fill="#D4A574"/>
    {/* Hair */}
    <path d="M32 32 Q32 20 40 18 Q45 15 50 15 Q55 15 60 18 Q68 20 68 32 L68 38 Q68 40 66 40 L34 40 Q32 40 32 38 Z" fill="#2C3E50"/>
    {/* Eyebrows */}
    <path d="M40 36 Q42 35 44 36" stroke="#1A252F" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M56 36 Q58 35 60 36" stroke="#1A252F" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Eyes */}
    <circle cx="42" cy="40" r="2" fill="#2C3E50"/>
    <circle cx="58" cy="40" r="2" fill="#2C3E50"/>
    {/* Nose */}
    <path d="M50 44 L50 48" stroke="#B8956A" strokeWidth="1" strokeLinecap="round"/>
    {/* Smile */}
    <path d="M44 50 Q50 54 56 50" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* Facial hair - goatee */}
    <ellipse cx="50" cy="54" rx="3" ry="2" fill="#2C3E50"/>
    {/* Neck */}
    <rect x="44" y="56" width="12" height="8" fill="#C49B6B" rx="2"/>
    {/* Shoulders - Blue shirt */}
    <path d="M30 64 Q30 62 32 62 L44 62 L44 100 L56 100 L56 62 L68 62 Q70 62 70 64 L70 100 L30 100 Z" fill="#3498DB"/>
    {/* Collar */}
    <path d="M44 62 L46 66 L50 64 L54 66 L56 62" stroke="#2980B9" strokeWidth="1.5" fill="none"/>
  </svg>
);

const FemaleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background circle */}
    <circle cx="50" cy="50" r="50" fill="#FFF0F5"/>
    {/* Face */}
    <circle cx="50" cy="40" r="18" fill="#E8B4A0"/>
    {/* Hair - Long with bangs */}
    <path d="M32 28 Q32 18 38 15 Q44 12 50 12 Q56 12 62 15 Q68 18 68 28 L68 45 Q68 50 65 52 L60 48 L60 42 L40 42 L40 48 L35 52 Q32 50 32 45 Z" fill="#4A2C2A"/>
    {/* Bangs */}
    <path d="M35 28 Q38 24 42 24 Q46 22 50 22 Q54 22 58 24 Q62 24 65 28 L65 32 L35 32 Z" fill="#3A1F1F"/>
    {/* Eyebrows */}
    <path d="M40 36 Q42 35 44 36" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M56 36 Q58 35 60 36" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Eyes with lashes */}
    <circle cx="42" cy="40" r="2" fill="#2C3E50"/>
    <circle cx="58" cy="40" r="2" fill="#2C3E50"/>
    <path d="M40 38 L38 36" stroke="#2C1810" strokeWidth="1" strokeLinecap="round"/>
    <path d="M60 38 L62 36" stroke="#2C1810" strokeWidth="1" strokeLinecap="round"/>
    {/* Nose */}
    <path d="M50 44 L50 47" stroke="#D4A089" strokeWidth="1" strokeLinecap="round"/>
    {/* Smile with lipstick */}
    <path d="M44 50 Q50 54 56 50" stroke="#C85A7C" strokeWidth="2" strokeLinecap="round" fill="none"/>
    {/* Neck */}
    <rect x="44" y="56" width="12" height="8" fill="#DDA790" rx="2"/>
    {/* Shoulders - Pink top */}
    <path d="M30 64 Q30 62 32 62 L44 62 L44 100 L56 100 L56 62 L68 62 Q70 62 70 64 L70 100 L30 100 Z" fill="#FF69B4"/>
    {/* Neckline detail */}
    <path d="M44 62 Q50 68 56 62" stroke="#FF1493" strokeWidth="1.5" fill="none"/>
  </svg>
);

const TransgenderIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background circle */}
    <circle cx="50" cy="50" r="50" fill="#F5F0FF"/>
    {/* Face */}
    <circle cx="50" cy="40" r="18" fill="#D9C4A8"/>
    {/* Hair - Modern asymmetric style */}
    <path d="M32 30 Q32 20 38 16 Q44 13 50 13 Q56 13 62 16 Q68 20 68 30 L68 40 Q68 42 66 42 L58 42 L58 38 L42 38 L42 42 L34 42 Q32 42 32 40 Z" fill="#6B4E9A"/>
    {/* Side swept bangs */}
    <path d="M32 30 Q35 26 40 25 Q45 24 50 24 L50 32 L35 32 Z" fill="#5A3D7F"/>
    {/* Eyebrows */}
    <path d="M40 36 Q42 35 44 36" stroke="#4A3560" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M56 36 Q58 35 60 36" stroke="#4A3560" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Eyes */}
    <circle cx="42" cy="40" r="2" fill="#2C3E50"/>
    <circle cx="58" cy="40" r="2" fill="#2C3E50"/>
    {/* Nose */}
    <path d="M50 44 L50 48" stroke="#C4B098" strokeWidth="1" strokeLinecap="round"/>
    {/* Smile */}
    <path d="M44 50 Q50 54 56 50" stroke="#8B6F9C" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    {/* Neck */}
    <rect x="44" y="56" width="12" height="8" fill="#CFBAA0" rx="2"/>
    {/* Shoulders - Purple shirt */}
    <path d="M30 64 Q30 62 32 62 L44 62 L44 100 L56 100 L56 62 L68 62 Q70 62 70 64 L70 100 L30 100 Z" fill="#9B59B6"/>
    {/* Collar V-neck */}
    <path d="M44 62 L50 68 L56 62" stroke="#7D3C98" strokeWidth="1.5" fill="none"/>
    {/* Transgender symbol badge */}
    <circle cx="70" cy="70" r="12" fill="#FFFFFF" opacity="0.95"/>
    <circle cx="70" cy="70" r="4" stroke="#9B59B6" strokeWidth="1.5" fill="none"/>
    <path d="M70 66 L70 62 M68 64 L72 64" stroke="#9B59B6" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M73 73 L76 76 M76 73 L73 76" stroke="#9B59B6" strokeWidth="1.5" strokeLinecap="round"/>
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
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo (2).png" 
              alt="LE WORE Logo" 
              width={120} 
              height={40} 
              className="object-contain"
              priority
            />
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
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo (2).png" 
                  alt="LE WORE Logo" 
                  width={150} 
                  height={50} 
                  className="object-contain"
                  priority
                />
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
