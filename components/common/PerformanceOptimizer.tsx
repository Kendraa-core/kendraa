'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PerformanceOptimizer() {
  const pathname = usePathname();
  const performanceRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    // Monitor performance metrics only
    setupPerformanceMonitoring();
  }, [pathname]);

  // Setup performance monitoring
  const setupPerformanceMonitoring = () => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Monitor navigation timing
    if (performanceRef.current) {
      performanceRef.current.disconnect();
    }

    try {
      performanceRef.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            logPerformanceMetrics(navEntry);
          }
        }
      });

      performanceRef.current.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.log('[Performance] Performance monitoring not supported');
    }
  };

  const logPerformanceMetrics = (navEntry: PerformanceNavigationTiming) => {
    const metrics = {
      // Navigation timing
      dnsLookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
      tcpConnection: navEntry.connectEnd - navEntry.connectStart,
      serverResponse: navEntry.responseEnd - navEntry.responseStart,
      domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
      loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
      totalTime: navEntry.loadEventEnd - navEntry.fetchStart,

      // Resource timing
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
    };

    // Try to get paint timing
    try {
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');

      if (firstPaint) {
        metrics.firstPaint = firstPaint.startTime;
      }
      if (firstContentfulPaint) {
        metrics.firstContentfulPaint = firstContentfulPaint.startTime;
      }
    } catch (error) {
      // Paint timing not supported
    }

    // Try to get LCP
    try {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        const lcp = lcpEntries[lcpEntries.length - 1];
        metrics.largestContentfulPaint = lcp.startTime;
      }
    } catch (error) {
      // LCP not supported
    }

    console.log('[Performance] Page load metrics:', metrics);

    // Log slow performance warnings
    if (metrics.totalTime > 3000) {
      console.warn('[Performance] Slow page load detected:', metrics.totalTime + 'ms');
    }
    if (metrics.firstContentfulPaint > 1500) {
      console.warn('[Performance] Slow first contentful paint:', metrics.firstContentfulPaint + 'ms');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (performanceRef.current) {
        performanceRef.current.disconnect();
      }
    };
  }, []);

  return null;
} 