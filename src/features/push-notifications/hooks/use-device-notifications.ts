import * as React from "react"
import { useServerFn } from "@tanstack/react-start"

import {
  getPushPublicConfig,
  getPushSubscriptionStatus,
  removePushSubscription,
  savePushSubscription,
} from "@/features/push-notifications/server-fns"
import {
  createDevicePushSubscription,
  getDevicePushSubscriptionInput,
} from "@/features/push-notifications/utils/device-push-subscription"
import {
  getPushSupport,
  isIosDevice,
  isStandaloneDisplayMode,
} from "@/features/push-notifications/utils/push-browser"
import { getErrorMessage } from "@/lib/errors"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

type DeviceState = {
  installed: boolean
  isIos: boolean
  permission: NotificationPermission | "unavailable"
  active: boolean
  supported: boolean
  error: string | null
}

const initialState: DeviceState = {
  installed: false,
  isIos: false,
  permission: "unavailable",
  active: false,
  supported: false,
  error: null,
}

function useDeviceNotifications() {
  const saveSubscription = useServerFn(savePushSubscription)
  const removeSubscription = useServerFn(removePushSubscription)
  const readStatus = useServerFn(getPushSubscriptionStatus)
  const readPublicConfig = useServerFn(getPushPublicConfig)
  const [state, setState] = React.useState(initialState)
  const [isLoading, setIsLoading] = React.useState(true)
  const [pendingAction, setPendingAction] = React.useState<
    "enable" | "disable" | null
  >(null)

  const refresh = React.useCallback(async () => {
    setIsLoading(true)
    const support = getPushSupport()
    const deviceState: DeviceState = {
      installed: isStandaloneDisplayMode(),
      isIos: isIosDevice(),
      permission: support.notifications
        ? Notification.permission
        : "unavailable",
      active: false,
      supported: support.supported,
      error: null,
    }
    setState(deviceState)

    try {
      if (!support.supported || deviceState.permission !== "granted") return
      const registration = await navigator.serviceWorker.getRegistration()
      const subscription = await registration?.pushManager.getSubscription()
      if (!subscription) return

      const serverState = await readStatus({
        data: { endpoint: subscription.endpoint },
      })
      if (!serverState.active) {
        await saveSubscription({
          data: getDevicePushSubscriptionInput(subscription),
        })
      }
      setState({ ...deviceState, active: true })
    } catch (error) {
      setState({
        ...deviceState,
        error: getErrorMessage(
          error,
          "We could not check notifications on this device."
        ),
      })
    } finally {
      setIsLoading(false)
    }
  }, [readStatus, saveSubscription])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  async function setEnabled(enabled: boolean): Promise<void> {
    if (pendingAction || isLoading) return
    setPendingAction(enabled ? "enable" : "disable")
    try {
      if (enabled) {
        const { publicKey } = await readPublicConfig()
        const subscription = await createDevicePushSubscription(publicKey)
        await saveSubscription({
          data: getDevicePushSubscriptionInput(subscription),
        })
      } else {
        const registration = await navigator.serviceWorker.getRegistration()
        const subscription = await registration?.pushManager.getSubscription()
        if (subscription) {
          await removeSubscription({
            data: { endpoint: subscription.endpoint },
          })
          if (!(await subscription.unsubscribe()))
            throw new Error(
              "We could not turn off notifications on this device."
            )
        }
      }
      await refresh()
      showSuccessToast(
        enabled
          ? "Notifications enabled on this device."
          : "Notifications disabled on this device."
      )
    } catch (error) {
      await refresh()
      showErrorToast(error, {
        fallbackMessage: "We could not update notifications on this device.",
      })
    } finally {
      setPendingAction(null)
    }
  }

  return {
    state,
    isLoading,
    isPending: pendingAction !== null,
    checked: pendingAction ? pendingAction === "enable" : state.active,
    setEnabled,
  }
}

export { useDeviceNotifications }
