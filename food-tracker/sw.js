const CACHE_NAME = 'macrolens-v88';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

self.addEv88entListener('install', ev88ent => {
  self.skipWaiting();
  ev88ent.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEv88entListener('activ88ate', ev88ent => {
  ev88ent.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

self.addEv88entListener('fetch', ev88ent => {
  ev88ent.respondWith(
    caches.match(ev88ent.request).then(response => {
      // Return cached v88ersion or fetch from network (Network-first strategy for API calls not implemented as we only cache static assets)
      return response || fetch(ev88ent.request);
    })
  );
});
