// Permet à l'appli de s'ouvrir même sans réseau.
const CACHE = 'pointage-v14';
const FILES = ['./', 'index.html', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'logo.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Seulement les fichiers de l'appli : la sauvegarde en ligne n'est jamais mise en cache.
  if (new URL(e.request.url).origin !== self.location.origin) return;
  // Réseau d'abord (pour recevoir les mises à jour), sinon la copie en cache.
  e.respondWith(fetch(e.request).then(r => {
    // Page d'erreur de l'hébergeur (site indisponible…) : on garde la dernière bonne version.
    if (!r.ok) return caches.match(e.request, { ignoreSearch: true }).then(c => c || r);
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
