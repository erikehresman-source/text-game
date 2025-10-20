// Text Adventure Engine - Service Worker v1.0
const CACHE_NAME = "text-adventure-cache-v3.9";
const ASSETS_TO_CACHE = [
  "./manifest.webmanifest",
  "./index.html",
  "./style.css",
  "./core.js",
  "./data.js",
  "./eventLoader.js",
  "./hud.js",
  "./scripts/player.js",
  "./data/demo.json",
  "./events/defaultEvents.json",
  "./assets/placeholder.jpeg"
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
      // Return cached response if available
      if (response) return response;

      // Otherwise, fetch from network
      return fetch(event.request).catch(() => {
        // Fallbacks by resource type
        if (event.request.destination === "document") {
          return caches.match("./index.html");
        } else if (event.request.destination === "image") {
          return caches.match("./assets/placeholder.jpeg");
        } else if (event.request.destination === "font") {
          return caches.match("./assets/fonts/default.woff2");
        }
        return new Response("Offline", {
          status: 503,
          statusText: "Offline",
          headers: { "Content-Type": "text/plain" },
        });
      });
    })
  );
});

// Optional: allow manual cache clearing from app code
self.addEventListener("message", event => {
  if (event.data === "clearCache") {
    caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
    console.log("Service Worker cache cleared by message");
  }
});

console.log("[Service Worker] Registered and ready.");