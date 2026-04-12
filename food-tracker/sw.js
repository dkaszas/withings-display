const CACHE_NAME = 'macrolens-v91';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

self.addEv91entListener('install', ev91ent => {
  self.skipWaiting();
  ev91ent.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEv91entListener('activ91ate', ev91ent => {
  ev91ent.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

self.addEv91entListener('fetch', ev91ent => {
  ev91ent.respondWith(
    caches.match(ev91ent.request).then(response => {
      // Return cached v91ersion or fetch from network (Network-first strategy for API calls not implemented as we only cache static assets)
      return response || fetch(ev91ent.request);
    })
  );
});
