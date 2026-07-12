const CACHE_NAME = "rocketrota-pwa-v3"
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

const DEFAULT_NOTIFICATION = {
  title: "RocketRota",
  body: "You have a new RocketRota update.",
  icon: "/pwa/icon-192.png",
  badge: "/pwa/icon-180.png",
  tag: "rocketrota-update",
  data: { url: "/dashboard" },
}

self.addEventListener("push", (event) => {
  event.waitUntil(showPushNotification(event.data))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(openNotificationTarget(event.notification.data?.url))
})

async function showPushNotification(pushData) {
  const payload = parsePushPayload(pushData)
  const data = {
    notificationId: payload.data?.notificationId,
    url: getSafeInternalUrl(payload.data?.url),
  }

  await self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    tag: payload.tag,
    renotify: payload.renotify,
    data,
  })
}

function parsePushPayload(pushData) {
  if (!pushData) {
    return DEFAULT_NOTIFICATION
  }

  try {
    const value = pushData.json()

    if (!value || typeof value !== "object") {
      return DEFAULT_NOTIFICATION
    }

    return {
      title: getNonEmptyString(value.title, DEFAULT_NOTIFICATION.title),
      body: getNonEmptyString(value.body, DEFAULT_NOTIFICATION.body),
      icon: getSafeAssetPath(value.icon, DEFAULT_NOTIFICATION.icon),
      badge: getSafeAssetPath(value.badge, DEFAULT_NOTIFICATION.badge),
      tag: getNonEmptyString(value.tag, DEFAULT_NOTIFICATION.tag),
      renotify: value.renotify === true,
      data:
        value.data && typeof value.data === "object"
          ? value.data
          : DEFAULT_NOTIFICATION.data,
    }
  } catch {
    return DEFAULT_NOTIFICATION
  }
}

async function openNotificationTarget(value) {
  const targetUrl = getSafeInternalUrl(value)
  const windows = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  })

  for (const client of windows) {
    if ("navigate" in client && client.url !== targetUrl) {
      await client.navigate(targetUrl)
    }

    if ("focus" in client) {
      return client.focus()
    }
  }

  return self.clients.openWindow(targetUrl)
}

function getSafeInternalUrl(value) {
  try {
    const url = new URL(
      typeof value === "string" ? value : "/dashboard",
      self.location.origin
    )

    if (url.origin !== self.location.origin || !url.pathname.startsWith("/")) {
      return new URL("/dashboard", self.location.origin).href
    }

    return url.href
  } catch {
    return new URL("/dashboard", self.location.origin).href
  }
}

function getSafeAssetPath(value, fallback) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return fallback
  }

  return value
}

function getNonEmptyString(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}
