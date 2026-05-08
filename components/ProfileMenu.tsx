'use client';

import { User, LogOut, X } from 'lucide-react';
import Link from 'next/link';
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

  // If user is not logged in, show login/signup options
  if (!user) {
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
                <h2 className="text-lg font-bold">Welcome!</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-white/90">Please login to access your account</p>
            </div>

            {/* Login/Signup Buttons */}
            <div className="flex-1 p-4 flex flex-col gap-3">
              <Link
                href="/login"
                onClick={onClose}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition font-semibold text-center"
              >
                Login
              </Link>
              
              <Link
                href="/signup"
                onClick={onClose}
                className="w-full border-2 border-primary text-primary py-3 px-4 rounded-lg hover:bg-primary/5 transition font-semibold text-center"
              >
                Sign Up
              </Link>

              <p className="text-xs text-gray-500 text-center mt-4">
                Login to track orders, save favorites, and get exclusive offers
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const displayName = userData?.displayName || user?.displayName || 'User';
  const displayEmail = userData?.email || user?.email || '';
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
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                {userData?.gender === 'male' ? (
                  <MaleIcon className="w-10 h-10" />
                ) : userData?.gender === 'female' ? (
                  <FemaleIcon className="w-10 h-10" />
                ) : userData?.gender === 'transgender' ? (
                  <TransgenderIcon className="w-10 h-10" />
                ) : (
                  <div className="text-primary text-xl font-bold">{initial}</div>
                )}
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
