'use client';

import { User, LogOut, X } from 'lucide-react';
import Link from 'next/link';
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
