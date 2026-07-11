const CACHE_NAME = "rocketrota-pwa-v2"
const APP_ASSETS = [
  "/manifest.json",
  "/offline.html",
  "/brand/rocketrota-logo.png",
  "/brand/rocketrota-app-splash.png",
  "/pwa/icon-192.png",
  "/pwa/icon-180.png",
  "/pwa/icon-512.png",
  "/pwa/icon-maskable-512.png",
  "/pwa/splash-2048.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const request = event.request

  if (
    request.method !== "GET" ||
    new URL(request.url).origin !== self.location.origin
  ) {
    return
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline.html")))
    return
  }

  if (!["font", "image", "style"].includes(request.destination)) {
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkResponse = fetch(request).then((response) => {
        if (response.ok) {
          const responseCopy = response.clone()
          void caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, responseCopy))
        }
        return response
      })

      return cachedResponse ?? networkResponse
    })
  )
})
