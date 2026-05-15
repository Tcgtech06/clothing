'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Hide loader when route changes are complete
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    // Show loader on link clicks immediately to prevent page looking "stuck"
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.href) {
        // Use try-catch in case of invalid URLs
        try {
          const url = new URL(anchor.href);
          const isExternal = url.origin !== window.location.origin;
          const isSamePath = url.pathname === window.location.pathname;
          const hasTargetBlank = anchor.target === '_blank';
          const isDownload = anchor.hasAttribute('download');

          if (!isExternal && !isSamePath && !hasTargetBlank && !isDownload) {
            setIsLoading(true);
            
            // Safety timeout to hide loader if navigation gets stuck or fails
            setTimeout(() => {
              setIsLoading(false);
            }, 8000);
          }
        } catch (err) {
          // Ignore invalid URLs
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-white/95 backdrop-blur-md page-loader">
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Logo with pulse animation */}
        <div className="page-loader-logo animate-pulse">
          <Image
            src="/logo (2).png"
            alt="Loading..."
            width={280}
            height={280}
            className="object-contain"
            priority
          />
        </div>
        
        {/* Loading spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
