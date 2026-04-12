const CACHE_NAME = 'macrolens-v89';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

self.addEv89entListener('install', ev89ent => {
  self.skipWaiting();
  ev89ent.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEv89entListener('activ89ate', ev89ent => {
  ev89ent.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

self.addEv89entListener('fetch', ev89ent => {
  ev89ent.respondWith(
    caches.match(ev89ent.request).then(response => {
      // Return cached v89ersion or fetch from network (Network-first strategy for API calls not implemented as we only cache static assets)
      return response || fetch(ev89ent.request);
    })
  );
});
