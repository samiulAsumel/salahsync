// Cache-first app-shell service worker. Bump CACHE_NAME on every deploy so
// clients pick up the new files instead of serving a stale cached shell.
const CACHE_NAME = 'daily-routine-v5';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './css/app.css', './css/fonts.css',
  './js/app.js',
  './js/core/time.js', './js/core/prayer-times.js', './js/core/hijri.js',
  './js/core/timezone.js', './js/core/store.js', './js/core/schedule-engine.js',
  './js/data/defaults.js', './js/data/templates.js', './js/data/locations.js', './js/data/bd-geo.js',
  './js/ui/renderer.js', './js/ui/settings.js', './js/ui/form-fields.js',
  './js/ui/location-picker.js', './js/ui/bd-location.js',
  './js/ui/tracker.js', './js/ui/stats.js', './js/ui/clock.js', './js/ui/toast.js',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((res) => {
          if (res.ok && event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone()));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
