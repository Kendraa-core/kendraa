'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { cacheManager } from '@/utils/cacheManager';

interface ServiceWorkerRegistrationProps {
  children: React.ReactNode;
}

export default function ServiceWorkerRegistration({ children }: ServiceWorkerRegistrationProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Initialize cache management
    cacheManager.initialize();

    // Check if service workers are supported
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[SW] Service workers not supported');
      return;
    }

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none', // Always check for updates
        });

        console.log('[SW] Service worker registered:', registration);
        setSwRegistration(registration);

        // Check for updates
        if (registration && registration.addEventListener) {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker && newWorker.addEventListener) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  showUpdateNotification();
                }
              });
            }
          });
        }

        // Handle service worker updates
        let refreshing = false;
        if (navigator.serviceWorker && navigator.serviceWorker.addEventListener) {
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
              refreshing = true;
              window.location.reload();
            }
          });
        }

        // Clear old caches on first load
        await cacheManager.clearOldCaches();

      } catch (error) {
        console.error('[SW] Service worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, []);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('You are back online!', {
        duration: 3000,
        icon: '🌐',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Some features may be limited.', {
        duration: 5000,
        icon: '📡',
      });
    };

    // Set initial online status
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    // Add event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Show update notification
  const showUpdateNotification = () => {
    toast.success(
      (t) => (
        <div className="flex items-center space-x-3">
          <span>New version available!</span>
          <button
            onClick={() => {
              if (swRegistration?.waiting) {
                swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
              }
              toast.dismiss(t.id);
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Update
          </button>
        </div>
      ),
      {
        duration: 10000,
        icon: '🔄',
      }
    );
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('[SW] Notifications not supported');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('[SW] Notification permission granted');
        toast.success('Notifications enabled!');
      }
    }
  };

  // Subscribe to push notifications
  const subscribeToPushNotifications = async () => {
    if (!swRegistration) {
      console.log('[SW] Service worker not registered');
      return;
    }

    try {
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      console.log('[SW] Push subscription:', subscription);
      
      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      toast.success('Push notifications enabled!');
    } catch (error) {
      console.error('[SW] Push subscription failed:', error);
      toast.error('Failed to enable push notifications');
    }
  };

  // Background sync for offline actions
  const performBackgroundSync = async () => {
    if (!swRegistration || !('sync' in swRegistration) || !swRegistration.sync) {
      console.log('[SW] Background sync not supported');
      return;
    }

    try {
      await (swRegistration.sync as any).register('background-sync');
      console.log('[SW] Background sync registered');
      toast.success('Data will sync when online');
    } catch (error) {
      console.error('[SW] Background sync failed:', error);
      toast.error('Background sync failed');
    }
  };

  // Clear cache using cache manager
  const clearCache = async () => {
    try {
      await cacheManager.clearAllCaches();
      toast.success('Cache cleared successfully');
    } catch (error) {
      console.error('[SW] Cache clear failed:', error);
      toast.error('Failed to clear cache');
    }
  };

  // Get cache info using cache manager
  const getCacheInfo = async () => {
    try {
      return await cacheManager.getCacheInfo();
    } catch (error) {
      console.error('[SW] Cache info failed:', error);
      return { total: 0, caches: [] };
    }
  };

  // Force refresh
  const forceRefresh = async () => {
    try {
      await cacheManager.forceRefresh();
    } catch (error) {
      console.error('[SW] Force refresh failed:', error);
      toast.error('Failed to refresh');
    }
  };

  // Expose functions to window for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).swUtils = {
        requestNotificationPermission,
        subscribeToPushNotifications,
        performBackgroundSync,
        clearCache,
        getCacheInfo,
        forceRefresh,
        isOnline,
        swRegistration,
      };
    }
  }, [isOnline, swRegistration]);

  return (
    <>
      {children}
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Offline</span>
          </div>
        </div>
      )}
    </>
  );
} 