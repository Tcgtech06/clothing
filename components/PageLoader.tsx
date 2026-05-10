'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show loader when route changes
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-white/90 backdrop-blur-sm page-loader">
      <div className="flex flex-col items-center justify-center gap-3">
        {/* Logo with pulse animation */}
        <div className="page-loader-logo">
          <Image
            src="/logo (2).png"
            alt="Loading..."
            width={120}
            height={120}
            className="object-contain"
            priority
          />
        </div>
        
        {/* Loading spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
