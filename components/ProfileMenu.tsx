'use client';

import { User, Package, Award, LogOut, X } from 'lucide-react';
import Link from 'next/link';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">My Account</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-primary text-2xl font-bold">
                J
              </div>
              <div>
                <p className="font-semibold text-lg">John Doe</p>
                <p className="text-sm text-white/80">john@example.com</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 p-6 border-b">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-gray-800">12</p>
              <p className="text-sm text-gray-600">Orders</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">2,450</p>
              <p className="text-sm text-gray-600">Points</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-100 transition"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">My Profile</span>
            </Link>
            
            <Link
              href="/orders"
              onClick={onClose}
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-100 transition"
            >
              <Package className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">My Orders</span>
            </Link>
            
            <Link
              href="/loyalty"
              onClick={onClose}
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-100 transition"
            >
              <Award className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">Loyalty Points</span>
            </Link>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
