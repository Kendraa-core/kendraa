const CACHE_NAME = 'kendraa-v1';
const STATIC_CACHE = 'kendraa-static-v1';
const DYNAMIC_CACHE = 'kendraa-dynamic-v1';

// Skip these URLs from caching
const SKIP_CACHE_URLS = [
  'chrome-extension://',
  'moz-extension://',
  'safari-extension://',
  'ms-browser-extension://',
  'edge-extension://',
  'chrome://',
  'moz://',
  'safari://',
  'ms://',
  'edge://',
  'about:',
  'data:',
  'blob:',
  'file:',
];

// Check if URL should be skipped
function shouldSkipCache(url) {
  return SKIP_CACHE_URLS.some(skipUrl => url.startsWith(skipUrl));
}

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/offline',
        '/Kendraa Logo.png',
        '/favicon.ico',
        '/manifest.json',
      ]);
    }).then(() => {
      console.log('[SW] Static resources cached');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('[SW] Cache installation failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome extensions and other problematic URLs
  if (shouldSkipCache(request.url)) {
    console.log('[SW] Skipping cache for:', request.url);
    return;
  }

  // Skip Next.js internal requests
  if (url.pathname.startsWith('/_next/') || 
      url.pathname.startsWith('/__nextjs_') ||
      url.pathname.includes('webpack') ||
      url.pathname.includes('hot-update')) {
    return;
  }

  // Handle different types of requests
  if (request.method === 'GET') {
    if (request.destination === 'document') {
      event.respondWith(handleDocumentRequest(request));
    } else if (request.destination === 'image') {
      event.respondWith(handleImageRequest(request));
    } else if (request.destination === 'script' || request.destination === 'style') {
      event.respondWith(handleStaticRequest(request));
    } else {
      event.respondWith(handleOtherRequest(request));
    }
  }
});

// Handle document requests (pages)
async function handleDocumentRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('[SW] Network failed for document, trying cache:', request.url);
  }

  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Fallback to offline page
  return caches.match('/offline');
}

// Handle image requests
async function handleImageRequest(request) {
  try {
    // Try cache first for images
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try network
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('[SW] Image fetch failed:', request.url);
  }

  // Return a placeholder or null
  return new Response(null, { status: 404 });
}

// Handle static requests (CSS, JS)
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try network
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('[SW] Static resource fetch failed:', request.url);
  }

  return new Response(null, { status: 404 });
}

// Handle other requests (API calls, etc.)
async function handleOtherRequest(request) {
  try {
    // Try network first for API calls
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful API responses for a short time
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
      return response;
    }
  } catch (error) {
    console.log('[SW] API request failed:', request.url);
  }

  // Try cache as fallback
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  return new Response(null, { status: 404 });
}

// Handle background sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Kendraa',
    icon: '/Kendraa Logo.png',
    badge: '/Kendraa Logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/Kendraa Logo.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/Kendraa Logo.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Kendraa', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/feed')
    );
  }
});

// Background sync function
async function performBackgroundSync() {
  try {
    console.log('[SW] Performing background sync...');
    
    // Sync any pending data
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/')) {
        try {
          await fetch(request);
        } catch (error) {
          console.log('[SW] Background sync failed for:', request.url);
        }
      }
    }
    
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync error:', error);
  }
}

// Handle cache clear message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('[SW] All caches cleared');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
}); 