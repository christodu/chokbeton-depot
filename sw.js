// Service Worker — CHOK BETON Matériel
const CACHE_NAME = 'chokbeton-v4';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(['./']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Laisser Firebase gérer ses propres requêtes réseau
  const url = e.request.url;
  if (url.includes('firestore') || url.includes('googleapis') || url.includes('gstatic')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Mettre en cache les réponses OK
        if (res && res.status === 200 && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
