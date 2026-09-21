const CACHE = "poulailler-v1";
const FILES = ["./","index.html","serie.html","css/style.css","js/storage.js","js/app.js","js/serie.js","manifest.json"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});
self.addEventListener("fetch", event => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
