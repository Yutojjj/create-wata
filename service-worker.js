const CACHE_NAME = "prompt-canvas-" + "2026062901";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./template-previews/gakudo_kenies.png",
  "./template-previews/gakudo_simple.png",
  "./template-previews/juku_standard.png",
  "./template-previews/super_weekly.png",
  "./template-previews/super_new_open.png",
  "./template-previews/restaurant_standard.png",
  "./template-previews/cafe_new.png",
  "./template-previews/realestate_sale.png",
  "./template-previews/salon_campaign.png",
  "./template-previews/event_fes.png",
  "./template-previews/event_seminar.png",
  "./template-previews/clinic_open.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // index.html は常にネットワーク優先（キャッシュは fallback）
  if (url.pathname === "/" || url.pathname.endsWith("/index.html")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // その他は Cache First
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});