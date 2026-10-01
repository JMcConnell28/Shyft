import type { SavePushSubscriptionInput } from "@/features/push-notifications/types"
import {
  isStandaloneDisplayMode,
  urlBase64ToUint8Array,
} from "@/features/push-notifications/utils/push-browser"

async function createDevicePushSubscription(
  publicKey: string
): Promise<PushSubscription> {
  const permission = await Notification.requestPermission()
  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Notifications are blocked in browser settings."
        : "Notification permission was not granted."
    )
  }

  const registration = await navigator.serviceWorker.register("/sw.js")
  await navigator.serviceWorker.ready
  const applicationServerKey = urlBase64ToUint8Array(publicKey)
  let subscription = await registration.pushManager.getSubscription()

  if (
    subscription &&
    !keysMatch(subscription.options.applicationServerKey, applicationServerKey)
  ) {
    if (!(await subscription.unsubscribe()))
      throw new Error("We could not update this device's notifications.")
    subscription = null
  }

  return (
    subscription ??
    registration.pushManager.subscribe({
      applicationServerKey,
      userVisibleOnly: true,
    })
  )
}

function getDevicePushSubscriptionInput(
  subscription: PushSubscription
): SavePushSubscriptionInput {
  const json = subscription.toJSON()
  if (!json.endpoint || !json.keys?.auth || !json.keys.p256dh) {
    throw new Error("The browser returned an incomplete push subscription.")
  }

  return {
    deviceDescription: `${navigator.platform || "Device"} · ${isStandaloneDisplayMode() ? "Installed app" : "Browser"}`,
    platform: navigator.platform,
    subscription: {
      endpoint: json.endpoint,
      expirationTime: json.expirationTime,
      keys: { auth: json.keys.auth, p256dh: json.keys.p256dh },
    },
  }
}

function keysMatch(current: ArrayBuffer | null, expected: Uint8Array): boolean {
  if (!current) return false
  const currentBytes = new Uint8Array(current)
  return (
    currentBytes.length === expected.length &&
    currentBytes.every((value, index) => value === expected[index])
  )
}

export { createDevicePushSubscription, getDevicePushSubscriptionInput }
