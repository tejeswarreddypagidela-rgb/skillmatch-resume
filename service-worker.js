// SkillMatch service worker — caches the whole app shell on install so it
// keeps working offline after the first visit. Bump CACHE_NAME whenever any
// cached file changes so returning visitors pick up the update instead of
// being stuck on a stale cache forever.
const CACHE_NAME = "skillmatch-v12";

const APP_SHELL = [
  "./",
  "./index.html",
  "./about.html",
  "./pricing.html",
  "./contact.html",
  "./privacy.html",
  "./terms.html",
  "./style.css",
  "./app.js",
  "./theme.js",
  "./skills-db.js",
  "./fflate.min.js",
  "./pdf.min.mjs",
  "./pdf.worker.min.mjs",
  "./tesseract.min.js",
  "./tesseract-worker-embedded.js",
  "./jspdf.umd.min.js",
  "./bg-photo.jpg",
  "./manifest.json",
  "./favicon.ico",
  "./icons/icon-32.png",
  "./icons/icon-192.png",
  "./icons/icon-192-maskable.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Add files individually so one failure (e.g. a slow connection on the
      // large embedded OCR file) doesn't abort caching the rest of the shell.
      await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

// Cache-first for everything in our own origin -- this app has no backend
// and no dynamic data, so a stale cache is never actually stale in the way
// that matters; explicit updates happen by bumping CACHE_NAME above.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }
        return response;
      } catch (err) {
        if (event.request.mode === "navigate") {
          const fallback = await caches.match("./index.html");
          if (fallback) return fallback;
        }
        throw err;
      }
    })()
  );
});
