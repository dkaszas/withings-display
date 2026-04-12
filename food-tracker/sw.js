const CACHE_NAME = 'macrolens-v85';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

self.addEv85entListener('install', ev85ent => {
  self.skipWaiting();
  ev85ent.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEv85entListener('activ85ate', ev85ent => {
  ev85ent.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

self.addEv85entListener('fetch', ev85ent => {
  ev85ent.respondWith(
    caches.match(ev85ent.request).then(response => {
      // Return cached v85ersion or fetch from network (Network-first strategy for API calls not implemented as we only cache static assets)
      return response || fetch(ev85ent.request);
    })
  );
});
