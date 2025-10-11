// Text Adventure Engine - Service Worker v1.0
const CACHE_NAME = "text-adventure-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./core.js",
  "./data.js",
  "./eventLoader.js",
  "./hud.js",
  "./scripts/player.js",
  "./data/demo.json",
  "./events/defaultEvents.json",
  "./manifest.webmanifest"
];

// Install Service Worker and pre-cache assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Caching core assets...");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate and clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log("Removing old cache:", key);
          return caches.delete(key);
        }
      }))
    )
  );
});

// Fetch cached assets first, then fall back to network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        });
      }).catch(() => caches.match("./index.html"));
    })
  );
});