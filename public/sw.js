// Service worker בסיסי — קאשינג "network-first" לנכסים מאותו מקור בלבד,
// כדי שהאתר יעבוד חלקית גם ללא רשת אחרי ביקור ראשון. לא נוגע ב-API
// חיצוניים (Sefaria/YouTube/Fonts) — אלה תמיד נטענים ישירות מהרשת.
const CACHE_NAME = 'chitat-yomi-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const fresh = await fetch(request);
        cache.put(request, fresh.clone());
        return fresh;
      } catch {
        const cached = await cache.match(request);
        if (cached) return cached;
        throw new Error('offline and not cached');
      }
    })
  );
});
