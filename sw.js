const CACHE_NAME = 'stop-alert-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap'
];

// Install: Cache files
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // We use map to catch individual file errors so the whole SW doesn't crash
      return Promise.all(
        ASSETS.map((url) => {
          return cache.add(url).catch((err) => console.log('Failed to cache:', url));
        })
      );
    })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-distance') {
    event.waitUntil(fetchDistance());
  }
});
// Fetch: Serve from cache, fallback to network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).catch(() => {
        // Fallback for when both cache and network fail (offline)
        console.log("Offline and no cache for:", e.request.url);
      });
    })
  );
});