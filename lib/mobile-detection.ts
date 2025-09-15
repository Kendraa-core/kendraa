'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth <= 768;
}

export function isMobileRoute(pathname: string): boolean {
  return pathname.startsWith('/mob/');
}

export function getMobileRoute(pathname: string, userType?: 'individual' | 'institution'): string {
  // If already a mobile route, return as is
  if (isMobileRoute(pathname)) {
    return pathname;
  }

  // Handle institution routes
  if (pathname.startsWith('/institution/')) {
    const institutionPath = pathname.replace('/institution', '');
    return `/mob/institution${institutionPath}`;
  }

  // Handle auth routes (should not be redirected)
  if (pathname.startsWith('/(auth)') || 
      pathname === '/signin' || 
      pathname === '/signup' || 
      pathname === '/forgot-password' || 
      pathname === '/reset-password' ||
      pathname === '/verify-otp') {
    return pathname;
  }

  // Handle root and other routes
  if (pathname === '/') {
    return '/mob';
  }

  // For other routes, add /mob prefix
  return `/mob${pathname}`;
}

export function getDesktopRoute(pathname: string): string {
  // If not a mobile route, return as is
  if (!isMobileRoute(pathname)) {
    return pathname;
  }

  // Handle mobile institution routes
  if (pathname.startsWith('/mob/institution/')) {
    const institutionPath = pathname.replace('/mob/institution', '');
    return `/institution${institutionPath}`;
  }

  // Handle mobile root
  if (pathname === '/mob') {
    return '/';
  }

  // For other mobile routes, remove /mob prefix
  return pathname.replace('/mob', '');
}

export function useMobileRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = isMobileDevice();
      setIsMobile(mobile);

      // Don't redirect auth pages
      if (pathname.startsWith('/(auth)') || 
          pathname === '/signin' || 
          pathname === '/signup' || 
          pathname === '/forgot-password' || 
          pathname === '/reset-password' ||
          pathname === '/verify-otp') {
        return;
      }

      const isCurrentlyMobileRoute = isMobileRoute(pathname);

      if (mobile && !isCurrentlyMobileRoute) {
        // Redirect to mobile version
        const mobileRoute = getMobileRoute(pathname);
        router.replace(mobileRoute);
      } else if (!mobile && isCurrentlyMobileRoute) {
        // Redirect to desktop version
        const desktopRoute = getDesktopRoute(pathname);
        router.replace(desktopRoute);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [pathname, router]);

  return { isMobile };
}
