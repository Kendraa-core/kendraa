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

    // Preload critical resources based on current route
    preloadCriticalResources();
    
    // Monitor performance metrics
    setupPerformanceMonitoring();
    
    // Prefetch next likely pages
    prefetchNextPages();
  }, [pathname]);

  // Preload critical resources
  const preloadCriticalResources = () => {
    if (typeof document === 'undefined') return;

    const criticalResources = [
      // CSS and JS bundles
      '/static/css/app/layout.css',
      '/static/chunks/main-app.js',
      
      // Critical images
      '/favicon.ico',
      
      // API endpoints that are likely to be called
      '/api/profiles',
      '/api/posts',
    ];

    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.endsWith('.ico') || resource.endsWith('.png') || resource.endsWith('.jpg')) {
        link.as = 'image';
      } else {
        link.as = 'fetch';
      }
      
      document.head.appendChild(link);
    });
  };

  // Prefetch next likely pages
  const prefetchNextPages = () => {
    if (typeof document === 'undefined') return;

    const prefetchRoutes = {
      '/': ['/feed', '/signin'],
      '/signin': ['/feed', '/signup'],
      '/signup': ['/feed', '/signin'],
      '/feed': ['/profile', '/messaging', '/jobs'],
      '/profile': ['/feed', '/messaging'],
      '/messaging': ['/feed', '/profile'],
    };

    const routesToPrefetch = prefetchRoutes[pathname as keyof typeof prefetchRoutes] || [];
    
    routesToPrefetch.forEach((route) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  };

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

      // Monitor resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (resourceEntry.initiatorType === 'fetch' && resourceEntry.duration > 1000) {
              console.warn('[Performance] Slow API call:', resourceEntry.name, resourceEntry.duration + 'ms');
            }
          }
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.error('[Performance] Error setting up performance monitoring:', error);
    }
  };

  // Log performance metrics
  const logPerformanceMetrics = (navEntry: PerformanceNavigationTiming) => {
    const metrics = {
      page: pathname,
      loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
      domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
    };

    // Get paint timing if available
    if (typeof performance !== 'undefined' && 'getEntriesByType' in performance) {
      try {
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach((entry) => {
          if (entry.name === 'first-paint') {
            metrics.firstPaint = entry.startTime;
          }
          if (entry.name === 'first-contentful-paint') {
            metrics.firstContentfulPaint = entry.startTime;
          }
        });
      } catch (error) {
        console.error('[Performance] Error getting paint entries:', error);
      }
    }

    // Log to console and potentially send to analytics
    console.log('[Performance] Page load metrics:', metrics);
    
    // Send to analytics if needed
    if (process.env.NODE_ENV === 'production') {
      // sendToAnalytics(metrics);
    }
  };

  // Optimize images
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const optimizeImages = () => {
      try {
        const images = document.querySelectorAll('img');
        images.forEach((img) => {
          // Add loading="lazy" to images below the fold
          if (!img.hasAttribute('loading')) {
            img.loading = 'lazy';
          }
          
          // Add decoding="async" for better performance
          if (!img.hasAttribute('decoding')) {
            img.decoding = 'async';
          }
        });
      } catch (error) {
        console.error('[Performance] Error optimizing images:', error);
      }
    };

    // Run after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizeImages);
    } else {
      optimizeImages();
    }
  }, [pathname]);

  // Optimize fonts
  useEffect(() => {
    if (typeof document === 'undefined') return;

    try {
      // Preload critical fonts
      const fontLinks = [
        { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', as: 'style' },
      ];

      fontLinks.forEach((font) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = font.href;
        link.as = font.as;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    } catch (error) {
      console.error('[Performance] Error preloading fonts:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (performanceRef.current) {
        try {
          performanceRef.current.disconnect();
        } catch (error) {
          console.error('[Performance] Error disconnecting observer:', error);
        }
      }
    };
  }, []);

  return null; // This component doesn't render anything
} 