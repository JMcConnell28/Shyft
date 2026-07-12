"use client"

import * as React from "react"
import { useServerFn } from "@tanstack/react-start"
import { BellIcon, SmartphoneIcon } from "lucide-react"

import {
  getPushPublicConfig,
  getPushSubscriptionStatus,
  removePushSubscription,
  savePushSubscription,
  sendTestPushToCurrentDevice,
  sendTestPushToCurrentUser,
} from "@/features/push-notifications/server-fns"
import {
  getPushSupport,
  isIosDevice,
  isStandaloneDisplayMode,
  urlBase64ToUint8Array,
} from "@/features/push-notifications/utils/push-browser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

type DeviceState = {
  endpoint: string | null
  installed: boolean
  isIos: boolean
  permission: NotificationPermission | "unavailable"
  serverActive: boolean
  supported: boolean
  syncError: string | null
}

const initialState: DeviceState = {
  endpoint: null,
  installed: false,
  isIos: false,
  permission: "unavailable",
  serverActive: false,
  supported: false,
  syncError: null,
}

function NotificationSettingsCard() {
  const saveSubscription = useServerFn(savePushSubscription)
  const removeSubscription = useServerFn(removePushSubscription)
  const readStatus = useServerFn(getPushSubscriptionStatus)
  const readPublicConfig = useServerFn(getPushPublicConfig)
  const sendTest = useServerFn(sendTestPushToCurrentDevice)
  const sendUserTest = useServerFn(sendTestPushToCurrentUser)
  const [state, setState] = React.useState<DeviceState>(initialState)
  const [pendingAction, setPendingAction] = React.useState<
    "enable" | "disable" | "test" | null
  >(null)

  const refresh = React.useCallback(async () => {
    const support = getPushSupport()
    const installed = isStandaloneDisplayMode()
    const isIos = isIosDevice()
    const permission = support.notifications
      ? Notification.permission
      : "unavailable"

    setState({
      endpoint: null,
      installed,
      isIos,
      permission,
      serverActive: false,
      supported: support.supported,
      syncError: null,
    })

    if (!support.supported) {
      return
    }

    const registration = await navigator.serviceWorker.getRegistration()
    const subscription = await registration?.pushManager.getSubscription()
    const endpoint = subscription?.endpoint ?? null
    setState({
      endpoint,
      installed,
      isIos,
      permission,
      serverActive: Boolean(subscription),
      supported: true,
      syncError: null,
    })

    try {
      const serverState = await readStatus({
        data: { endpoint: endpoint ?? undefined },
      })

      if (subscription && !serverState.active) {
        await syncSubscription(subscription, saveSubscription)
      }
    } catch (error) {
      setState((current) => ({
        ...current,
        syncError:
          error instanceof Error
            ? error.message
            : "Notification server sync is unavailable.",
      }))
    }
  }, [readStatus, saveSubscription])

  React.useEffect(() => {
    void refresh().catch(() =>
      setState((current) => ({
        ...current,
        syncError: "We could not read this device's notification state.",
      }))
    )
  }, [refresh])

  const enable = async () => {
    setPendingAction("enable")
    try {
      const { publicKey } = await readPublicConfig()

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
        !keysMatch(
          subscription.options.applicationServerKey,
          applicationServerKey
        )
      ) {
        await subscription.unsubscribe()
        subscription = null
      }

      subscription ??= await registration.pushManager.subscribe({
        applicationServerKey,
        userVisibleOnly: true,
      })
      await syncSubscription(subscription, saveSubscription)
      await refresh()
      showSuccessToast("Notifications enabled on this device.")
    } catch (error) {
      showErrorToast(error, {
        fallbackMessage: "We could not enable notifications.",
      })
    } finally {
      setPendingAction(null)
    }
  }

  const disable = async () => {
    setPendingAction("disable")
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      const subscription = await registration?.pushManager.getSubscription()
      if (subscription) {
        await removeSubscription({ data: { endpoint: subscription.endpoint } })
        await subscription.unsubscribe()
      }
      await refresh()
      showSuccessToast("Notifications disabled on this device.")
    } catch (error) {
      showErrorToast(error, {
        fallbackMessage: "We could not disable notifications.",
      })
    } finally {
      setPendingAction(null)
    }
  }

  const test = async () => {
    if (!state.endpoint) return
    setPendingAction("test")
    try {
      await sendTest({ data: { endpoint: state.endpoint } })
      showSuccessToast("Test notification sent.")
    } catch (error) {
      showErrorToast(error, {
        fallbackMessage: "We could not send the test notification.",
      })
    } finally {
      setPendingAction(null)
    }
  }

  const testAllDevices = async () => {
    setPendingAction("test")
    try {
      await sendUserTest()
      showSuccessToast("Test sent to all your subscribed devices.")
    } catch (error) {
      showErrorToast(error, {
        fallbackMessage: "We could not send the multi-device test.",
      })
    } finally {
      setPendingAction(null)
    }
  }

  const needsIosInstall = state.isIos && !state.installed

  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BellIcon className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm">Push notifications</CardTitle>
          </div>
          <Badge variant={state.serverActive ? "outline" : "secondary"}>
            {state.serverActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <Status label="Supported" value={state.supported ? "Yes" : "No"} />
          <Status label="Permission" value={state.permission} />
          <Status
            label="Installed app"
            value={state.installed ? "Yes" : "No"}
          />
        </div>

        {needsIosInstall ? <IosInstallInstructions /> : null}
        {!state.supported && !needsIosInstall ? (
          <p className="text-sm text-muted-foreground">
            This browser does not support Web Push notifications.
          </p>
        ) : null}
        {state.syncError ? (
          <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            Browser support was detected, but RocketRota could not sync this
            device with the notification server. {state.syncError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => void enable()}
            disabled={
              !state.supported ||
              needsIosInstall ||
              state.permission === "denied" ||
              pendingAction !== null
            }
          >
            <BellIcon className="size-3.5" />
            {pendingAction === "enable"
              ? "Enabling..."
              : "Enable notifications"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void testAllDevices()}
            disabled={!state.serverActive || pendingAction !== null}
          >
            Send to all my devices
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void disable()}
            disabled={!state.endpoint || pendingAction !== null}
          >
            Disable
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void test()}
            disabled={!state.serverActive || pendingAction !== null}
          >
            {pendingAction === "test" ? "Sending..." : "Send test notification"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/10 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold capitalize">{value}</p>
    </div>
  )
}

function IosInstallInstructions() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <SmartphoneIcon className="size-4" />
        Install RocketRota first
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        <li>Open RocketRota in Safari.</li>
        <li>Choose Share, then Add to Home Screen.</li>
        <li>Open the installed RocketRota app.</li>
        <li>Return here and enable notifications.</li>
      </ol>
    </div>
  )
}

async function syncSubscription(
  subscription: PushSubscription,
  save: ReturnType<typeof useServerFn<typeof savePushSubscription>>
) {
  const json = subscription.toJSON()
  if (!json.endpoint || !json.keys?.auth || !json.keys.p256dh)
    throw new Error("The browser returned an incomplete push subscription.")
  await save({
    data: {
      deviceDescription: getDeviceDescription(),
      platform: navigator.platform,
      subscription: {
        endpoint: json.endpoint,
        expirationTime: json.expirationTime,
        keys: { auth: json.keys.auth, p256dh: json.keys.p256dh },
      },
    },
  })
}

function getDeviceDescription() {
  return `${navigator.platform || "Device"} · ${isStandaloneDisplayMode() ? "Installed app" : "Browser"}`
}

function keysMatch(current: ArrayBuffer | null, expected: Uint8Array) {
  if (!current) return false
  const currentBytes = new Uint8Array(current)
  return (
    currentBytes.length === expected.length &&
    currentBytes.every((value, index) => value === expected[index])
  )
}

export { NotificationSettingsCard }
