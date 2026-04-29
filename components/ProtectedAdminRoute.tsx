'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { Shield } from 'lucide-react';

export default function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdminAuthenticated) {
      router.push('/admin-login');
    }
  }, [isAdminAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
