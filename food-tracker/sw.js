const CACHE_NAME = 'macrolens-v86';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

self.addEv86entListener('install', ev86ent => {
  self.skipWaiting();
  ev86ent.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEv86entListener('activ86ate', ev86ent => {
  ev86ent.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

self.addEv86entListener('fetch', ev86ent => {
  ev86ent.respondWith(
    caches.match(ev86ent.request).then(response => {
      // Return cached v86ersion or fetch from network (Network-first strategy for API calls not implemented as we only cache static assets)
      return response || fetch(ev86ent.request);
    })
  );
});
