const CACHE_NAME = 'macrolens-v87';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

self.addEv87entListener('install', ev87ent => {
  self.skipWaiting();
  ev87ent.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEv87entListener('activ87ate', ev87ent => {
  ev87ent.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});

self.addEv87entListener('fetch', ev87ent => {
  ev87ent.respondWith(
    caches.match(ev87ent.request).then(response => {
      // Return cached v87ersion or fetch from network (Network-first strategy for API calls not implemented as we only cache static assets)
      return response || fetch(ev87ent.request);
    })
  );
});
