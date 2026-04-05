const CACHE_NAME = "g318-adv-pwa-v3";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./pwa-icon.svg",
  "./sw.js",
  "./README.md",
  "./川藏ADV摩旅路书_1.jsx",
  "./川藏ADV摩旅路书_装备清单_应急预案_2.md"
];

const NETWORK_FIRST_PATHS = [
  "/ADV_G318/",
  "/ADV_G318/index.html",
  "/ADV_G318/manifest.webmanifest",
  "/ADV_G318/sw.js",
  "/ADV_G318/%E5%B7%9D%E8%97%8FADV%E6%91%A9%E6%97%85%E8%B7%AF%E4%B9%A6_1.jsx",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const shouldUseNetworkFirst =
    request.mode === "navigate" ||
    NETWORK_FIRST_PATHS.includes(url.pathname);

  if (shouldUseNetworkFirst) {
    event.respondWith(
      fetch(request).then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        return response;
      }).catch(async () => {
        const cached = await caches.match(request);
        return cached || caches.match("./index.html") || caches.match("./");
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
        return response;
      }).catch(() => caches.match("./"));
    })
  );
});
