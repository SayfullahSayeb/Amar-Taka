// Service Worker for Amar Taka PWA
// Version 1.0.0

const CACHE_NAME = 'amar-taka-v1';
const DATA_CACHE_NAME = 'amar-taka-data-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',

    // CSS files
    '/css/styles.css',
    '/css/bk.css',

    // JavaScript files
    '/js/app.js',
    '/js/db.js',
    '/js/home.js',
    '/js/transactions.js',
    '/js/analysis.js',
    '/js/settings.js',
    '/js/budget.js',
    '/js/categories.js',
    '/js/categoryform.js',
    '/js/goals.js',
    '/js/profiles.js',
    '/js/applock.js',
    '/js/demomode.js',
    '/js/onboarding.js',
    '/js/export.js',
    '/js/lang.js',
    '/js/utils.js',
    '/js/version.js',
    '/js/modal-scroll-lock.js',

    // Images
    '/image/icon.png',

    // Pages
    '/pages/onboarding.html',

    // Fonts (if any external fonts are used, add them here)
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Handle API/data requests with network-first strategy
    if (request.url.includes('/api/') || request.method !== 'GET') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone the response before caching
                    const responseClone = response.clone();

                    caches.open(DATA_CACHE_NAME)
                        .then((cache) => {
                            cache.put(request, responseClone);
                        });

                    return response;
                })
                .catch(() => {
                    // If network fails, try to serve from cache
                    return caches.match(request);
                })
        );
        return;
    }

    // Handle static assets with cache-first strategy
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version and update cache in background
                    fetchAndCache(request);
                    return cachedResponse;
                }

                // If not in cache, fetch from network
                return fetchAndCache(request);
            })
            .catch((error) => {
                console.error('[Service Worker] Fetch failed:', error);

                // Return offline fallback page if available
                if (request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Helper function to fetch and cache
function fetchAndCache(request) {
    return fetch(request)
        .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type === 'error') {
                return response;
            }

            // Clone the response
            const responseClone = response.clone();

            // Cache the fetched response
            caches.open(CACHE_NAME)
                .then((cache) => {
                    cache.put(request, responseClone);
                });

            return response;
        });
}

// Handle messages from the client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                return self.clients.matchAll();
            }).then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        type: 'CACHE_CLEARED',
                        message: 'All caches have been cleared'
                    });
                });
            })
        );
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            type: 'VERSION',
            version: CACHE_NAME
        });
    }
});

// Background sync for offline transactions (if needed in future)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-transactions') {
        event.waitUntil(
            // Add your sync logic here
            console.log('[Service Worker] Background sync triggered')
        );
    }
});

// Push notification support (optional for future features)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New notification from Amar Taka',
        icon: '/image/icon.png',
        badge: '/image/icon.png',
        vibrate: [200, 100, 200],
        tag: 'amar-taka-notification',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification('Amar Taka', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If app is already open, focus it
                for (let client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise, open a new window
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

console.log('[Service Worker] Loaded successfully');
