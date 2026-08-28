// Network-first app-shell service worker (see the fetch handler below) —
// the cache exists purely for offline use, not to speed up/gate normal loads.
const CACHE_NAME = 'daily-routine-v13';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './css/app.css', './css/fonts.css',
  './js/app.js',
  './js/core/time.js', './js/core/prayer-times.js', './js/core/hijri.js', './js/core/i18n.js',
  './js/core/timezone.js', './js/core/store.js', './js/core/schedule-engine.js', './js/core/waqt-times.js',
  './js/data/defaults.js', './js/data/templates.js', './js/data/locations.js',
  './js/data/bd-geo.js', './js/data/world-geo.js',
  './js/i18n/strings.bn.js', './js/i18n/strings.en.js',
  './js/ui/renderer.js', './js/ui/settings.js', './js/ui/form-fields.js',
  './js/ui/location-picker.js', './js/ui/bd-location.js', './js/ui/prayer-panel.js', './js/ui/time-picker.js',
  './js/ui/prayer-times-table.js',
  './js/ui/tracker.js', './js/ui/stats.js', './js/ui/clock.js', './js/ui/toast.js',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './assets/fonts/Kalpurush.woff2', './assets/fonts/Kalpurush.ttf',
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

// Network-first for same-origin app files: while online, every reload gets the
// latest deploy immediately (no waiting for a new SW to activate on a second
// reload) — the cache is purely an offline fallback, not the default source.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const isSameOrigin = event.request.url.startsWith(self.location.origin);
  if (!isSameOrigin) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone()));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
