'use client';

import { User, LogOut, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const { user, userData, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const displayName = userData?.displayName || user?.displayName || 'User';
  const displayEmail = userData?.email || user?.email || 'user@example.com';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onClose}
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">My Account</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary text-xl font-bold">
                {initial}
              </div>
              <div>
                <p className="font-semibold text-base">{displayName}</p>
                <p className="text-xs text-white/80">{displayEmail}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition mb-3"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">My Profile</span>
            </Link>

            {/* Logout Button - Moved here */}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
