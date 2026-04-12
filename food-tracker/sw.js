const CACHE_NAME = 'macrolens-v90';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

self.addEv90entListener('install', ev90ent => {
  self.skipWaiting();
  ev90ent.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEv90entListener('activ90ate', ev90ent => {
  ev90ent.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

self.addEv90entListener('fetch', ev90ent => {
  ev90ent.respondWith(
    caches.match(ev90ent.request).then(response => {
      // Return cached v90ersion or fetch from network (Network-first strategy for API calls not implemented as we only cache static assets)
      return response || fetch(ev90ent.request);
    })
  );
});
