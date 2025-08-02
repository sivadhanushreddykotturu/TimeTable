const CACHE_NAME = 'kl-timetable-v6';
const STATIC_CACHE = 'kl-timetable-static-v6';
const DYNAMIC_CACHE = 'kl-timetable-dynamic-v6';

// Core files that should be cached immediately (keep minimal for faster install)
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Files that can be cached on demand
const DYNAMIC_FILES = [
  '/maskable_icon_x192.png',
  '/maskable_icon_x512.png'
];

// Install event - cache only essential files immediately
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - optimized caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.origin === location.origin) {
    // Same-origin requests
    event.respondWith(handleSameOriginRequest(request));
  } else {
    // Cross-origin requests (APIs, etc.)
    event.respondWith(handleCrossOriginRequest(request));
  }
});

async function handleSameOriginRequest(request) {
  try {
    // Try cache first for static assets
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Fetch failed:', error);
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      const offlinePage = await caches.match('/index.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

async function handleCrossOriginRequest(request) {
  try {
    // Try network first for API calls
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cross-origin fetch failed:', error);
    
    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any pending offline actions
  console.log('Performing background sync');
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/maskable_icon_x192.png',
    badge: '/maskable_icon_x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/maskable_icon_x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/maskable_icon_x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('KL Timetable', options)
  );
}); 