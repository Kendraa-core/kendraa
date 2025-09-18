'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This logic is now simpler and more targeted.
    // It should ONLY redirect if a user is logged in AND they are trying
    // to access the signin or signup pages.
    if (!loading && user && profile) {
      if (pathname === '/signin' || pathname === '/signup') {
        // Redirect based on user type and onboarding status
        if (profile.user_type === 'institution' || profile.profile_type === 'institution') {
          if (profile.onboarding_completed) {
            router.push('/institution/feed');
          } else {
            router.push('/institution/onboarding');
          }
        } else {
          if (profile.onboarding_completed) {
            router.push('/feed');
          } else {
            router.push('/onboarding');
          }
        }
      }
      // It will NOT redirect if the user is on /reset-password,
      // allowing that page to load correctly regardless of race conditions.
    }
  }, [user, profile, loading, router, pathname]);


  if (loading) {
    // Your loading spinner remains the same
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary-400 rounded-full animate-ping opacity-20"></div>
          </div>
          
          <p className="text-gray-600 mt-4 text-sm font-medium">Loading Kendraa...</p>
          
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

  // Prevent a flicker for users who are about to be redirected
  if (user && (pathname === '/signin' || pathname === '/signup')) {
    return null;
  }

  return children;
}

