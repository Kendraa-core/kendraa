'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useMobileRedirect } from '@/lib/mobile-detection';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  showBottomNav?: boolean;
  showSearch?: boolean;
  isInstitution?: boolean;
  requireAuth?: boolean;
}

export default function MobileLayout({
  children,
  title,
  showHeader = true,
  showBottomNav = true,
  showSearch = true,
  isInstitution = false,
  requireAuth = true
}: MobileLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useMobileRedirect();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push('/signin');
    }
  }, [user, loading, requireAuth, router]);

  // Show loading while checking authentication or mobile detection
  if (loading || (requireAuth && !user)) {
    return <LoadingSpinner variant="fullscreen" text="Loading..." />;
  }

  // Don't render on desktop (will be redirected)
  if (!isMobile && typeof window !== 'undefined') {
    return <LoadingSpinner variant="fullscreen" text="Redirecting..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      {showHeader && (
        <MobileHeader 
          title={title}
          showSearch={showSearch}
          isInstitution={isInstitution}
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 ${showBottomNav ? 'pb-16' : ''}`}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <MobileBottomNav isInstitution={isInstitution} />
      )}
    </div>
  );
}
