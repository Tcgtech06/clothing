'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [countdown, setCountdown] = useState(5);
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Play success audio
    const audio = new Audio('/sucess.mp3');
    audio.volume = 0.5; // Set volume to 50%
    audio.play().catch(error => {
      console.log('Audio playback failed:', error);
      // Browsers may block autoplay, but we try anyway
    });

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          window.location.href = '/orders';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      // Stop audio when component unmounts
      audio.pause();
      audio.currentTime = 0;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Animated Success Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <CheckCircle className="w-16 h-16 text-white animate-bounce" />
          </div>
          {/* Sound waves animation */}
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
            <div className="flex gap-1 items-end">
              <div className="w-1 bg-green-500 rounded-full animate-sound-wave" style={{ height: '12px', animationDelay: '0ms' }}></div>
              <div className="w-1 bg-green-500 rounded-full animate-sound-wave" style={{ height: '20px', animationDelay: '150ms' }}></div>
              <div className="w-1 bg-green-500 rounded-full animate-sound-wave" style={{ height: '16px', animationDelay: '300ms' }}></div>
            </div>
          </div>
          {/* Confetti effect */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full animate-ping"
                style={{
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1s',
                  left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 40}%`,
                  top: `${50 + Math.sin(i * 45 * Math.PI / 180) * 40}%`,
                }}
              />
            ))}
          </div>
        </div>
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
          Order Placed Successfully! 🎉
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your order. We&apos;ll send you a confirmation email shortly.
        </p>

        {orderId && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6 border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="font-mono font-bold text-lg text-gray-800">{orderId.substring(0, 12).toUpperCase()}</p>
          </div>
        )}

        {/* Auto-redirect countdown */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            <Package className="w-4 h-4 animate-pulse" />
            Redirecting to orders in {countdown}s...
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/orders"
            className="block w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Package className="w-5 h-5 inline mr-2" />
            View My Orders Now
          </Link>
          
          <Link
            href="/"
            className="block w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-all font-semibold hover:border-gray-400"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Success checkmark animation */}
        <style jsx>{`
          @keyframes checkmark {
            0% {
              stroke-dashoffset: 100;
            }
            100% {
              stroke-dashoffset: 0;
            }
          }
          
          @keyframes sound-wave {
            0%, 100% {
              transform: scaleY(0.5);
              opacity: 0.5;
            }
            50% {
              transform: scaleY(1.5);
              opacity: 1;
            }
          }
          
          .animate-sound-wave {
            animation: sound-wave 0.6s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
