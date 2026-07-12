function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/gu, "+").replace(/_/gu, "/")
  const decoded = globalThis.atob(base64)

  return Uint8Array.from(decoded, (character) => character.charCodeAt(0))
}

function isStandaloneDisplayMode() {
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    document.referrer.startsWith("android-app://") ||
    navigatorWithStandalone.standalone === true
  )
}

function isIosDevice() {
  return /iPad|iPhone|iPod/u.test(navigator.userAgent)
}

function getPushSupport() {
  const serviceWorker = "serviceWorker" in navigator
  const notifications = "Notification" in window
  const pushManager =
    "PushManager" in window ||
    ("ServiceWorkerRegistration" in window &&
      "pushManager" in ServiceWorkerRegistration.prototype)

  return {
    notifications,
    pushManager,
    serviceWorker,
    supported: serviceWorker && notifications && pushManager,
  }
}

export {
  getPushSupport,
  isIosDevice,
  isStandaloneDisplayMode,
  urlBase64ToUint8Array,
}
