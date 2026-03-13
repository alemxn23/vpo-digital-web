const CACHE_NAME = 'vpo-digital-v2-force-refresh';
const urlsToCache = [
  '/',
  '/index.html',
];

self.addEventListener('install', event => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  // Delete old caches
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Become available to all pages
  );
});


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          // If it's the main page, try to fetch fresh content in background to update cache
          if (event.request.url.includes('/index.html') || event.request.url === self.registration.scope) {
            fetch(event.request).then(response => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return;
              }
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }).catch(() => { });
          }
          return response;
        }
        return fetch(event.request);
      })
  );
});