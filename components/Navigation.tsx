'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Award, Package, User } from 'lucide-react';
import { useState } from 'react';
import ProfileMenu from './ProfileMenu';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Category', href: '/category', icon: Grid },
  { name: 'Loyalty Points', href: '/loyalty', icon: Award },
  { name: 'My Orders', href: '/orders', icon: Package },
];

export default function Navigation() {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileProfile, setShowMobileProfile] = useState(false);

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

          {/* Empty space for balance */}
          <div className="w-10"></div>
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
              
              {/* Profile Icon - Right Side for Desktop/Tablet */}
              <div className="relative ml-4">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white hover:shadow-lg transition"
                >
                  <User className="w-5 h-5" />
                </button>
                
                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-64 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-800">John Doe</p>
                      <p className="text-sm text-gray-500">john@example.com</p>
                    </div>
                    
                    {/* Stats */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Orders</span>
                        <span className="font-semibold text-primary">12</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Loyalty Points</span>
                        <span className="font-semibold text-orange-600">2,450</span>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/loyalty"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      Loyalty Points
                    </Link>
                    <hr className="my-2" />
                    <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                      Logout
                    </button>
                  </div>
                )}
              </div>
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
