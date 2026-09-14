const CACHE_NAME = 'korean-topik-v1';
const urlsToCache = [
  '/',
  '/flashcards',
  '/games',
  '/games/quiz',
  '/games/listening',
  '/games/typing',
  '/games/matching',
  '/games/speed',
  '/library',
  '/progress',
  '/settings',
  '/import',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  // Add static assets
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/framework.js',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/polyfills.js',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => {
          return new Request(url, { cache: 'reload' });
        }));
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle different strategies for different types of requests
  if (event.request.destination === 'document') {
    // For navigation requests, try network first, then cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response because it's a stream
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then((response) => {
              return response || caches.match('/');
            });
        })
    );
  } else {
    // For other requests, try cache first, then network
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          return response || fetch(event.request)
            .then((fetchResponse) => {
              // Check if we received a valid response
              if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                return fetchResponse;
              }
              
              // Clone the response
              const responseToCache = fetchResponse.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
                
              return fetchResponse;
            });
        })
        .catch(() => {
          // If both cache and network fail, return a fallback response for essential resources
          if (event.request.destination === 'image') {
            return new Response(
              '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#cccccc"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#666">No Image</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
        })
    );
  }
});

// Background sync for vocabulary data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync vocabulary progress data when back online
      syncVocabularyData()
    );
  }
});

async function syncVocabularyData() {
  try {
    // This would sync with a backend if implemented
    console.log('Syncing vocabulary data...');
    
    // For now, just update the cache with latest local data
    const cache = await caches.open(CACHE_NAME);
    const storedData = await getStoredVocabularyData();
    
    if (storedData) {
      await cache.put('/api/vocabulary', new Response(JSON.stringify(storedData)));
    }
  } catch (error) {
    console.error('Failed to sync vocabulary data:', error);
  }
}

async function getStoredVocabularyData() {
  // This would get data from IndexedDB
  try {
    return null; // Placeholder
  } catch (error) {
    console.error('Failed to get stored vocabulary data:', error);
    return null;
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_VOCABULARY') {
    // Cache vocabulary data
    const vocabularyData = event.data.data;
    caches.open(CACHE_NAME)
      .then((cache) => {
        cache.put('/api/vocabulary', new Response(JSON.stringify(vocabularyData)));
      });
  }
});