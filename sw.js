const CACHE = 'simgest-shell-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase y CDN externos: NUNCA cachear, dejar pasar directo
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('jsdelivr.net') ||
      url.hostname.includes('supabase.in')) {
    return;
  }

  // Recursos propios: primero red, fallback a caché
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
