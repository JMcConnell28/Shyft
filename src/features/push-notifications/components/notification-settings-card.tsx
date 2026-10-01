"use client"

import { BellIcon } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { useDeviceNotifications } from "@/features/push-notifications/hooks/use-device-notifications"
import { SettingsSection } from "@/features/settings/components/settings-section"

function NotificationSettingsCard() {
  const { state, isLoading, isPending, checked, setEnabled } =
    useDeviceNotifications()
  const needsIosInstall = state.isIos && !state.installed
  const cannotEnable =
    !state.supported || needsIosInstall || state.permission === "denied"
  let guidance: string | null = null
  if (needsIosInstall) {
    guidance =
      "In Safari, choose Share → Add to Home Screen, then open the installed RocketRota app to enable notifications."
  } else if (!state.supported && !isLoading) {
    guidance = "Notifications aren't available in this browser."
  } else if (state.permission === "denied") {
    guidance =
      "Allow notifications in your browser settings to turn them on here."
  }

  return (
    <SettingsSection
      title="Notifications"
      icon={BellIcon}
      description="Receive rota updates and announcements on this device."
    >
      <div className="space-y-3 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <label
              htmlFor="device-notifications"
              className="text-xs font-bold text-[#14214a]"
            >
              Notifications on this device
            </label>
            <p
              id="device-notifications-description"
              className="mt-1 text-[11px] text-[#7180a2]"
            >
              Get updates even when RocketRota is closed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isLoading || isPending ? (
              <span role="status" className="text-xs text-[#7180a2]">
                {isPending ? "Saving..." : "Checking..."}
              </span>
            ) : null}
            <Switch
              id="device-notifications"
              aria-describedby="device-notifications-description"
              className="data-checked:bg-[#0868f7]"
              checked={checked}
              disabled={isLoading || isPending || (cannotEnable && !checked)}
              onCheckedChange={(enabled) => void setEnabled(enabled)}
            />
          </div>
        </div>
        {guidance ? (
          <p className="text-xs leading-5 text-[#657398]">{guidance}</p>
        ) : null}
        {state.error ? (
          <p role="alert" className="text-xs text-destructive">
            {state.error}
          </p>
        ) : null}
      </div>
    </SettingsSection>
  )
}

export { NotificationSettingsCard }
