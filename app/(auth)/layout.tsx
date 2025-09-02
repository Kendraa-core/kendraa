'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/feed');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            {/* Main spinner */}
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            
            {/* Pulse effect */}
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary-400 rounded-full animate-ping opacity-20"></div>
          </div>
          
          <p className="text-gray-600 mt-4 text-sm font-medium">Loading <span className="mulish-semibold">kendraa</span>...</p>
          
          {/* Progress dots */}
          <div className="flex justify-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return children;
} 