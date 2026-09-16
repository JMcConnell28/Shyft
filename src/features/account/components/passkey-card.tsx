"use client"

import { FingerprintIcon, PlusIcon } from "lucide-react"
import type { Passkey } from "@better-auth/passkey"

import type { PasskeySupport } from "@/features/account/hooks/use-passkey-support"
import { Button } from "@/components/ui/button"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { usePasskeySettings } from "@/features/account/hooks/use-passkey-settings"
import { Input } from "@/components/ui/input"
import { PasskeyRow } from "@/features/account/components/passkey-row"

function PasskeyCard() {
  const {
    name,
    setName,
    passkeySupport,
    isSupported,
    passkeysQuery,
    addMutation,
  } = usePasskeySettings()

  return (
    <SettingsSection
      title="Face ID & fingerprint"
      icon={FingerprintIcon}
      description="Sign in using your face, fingerprint or device PIN."
    >
      <div className="space-y-4 py-3">
        <div className="space-y-2 text-xs leading-5 text-[#657398]">
          <p>
            Use Face ID, Touch ID, Windows Hello or your device PIN instead of
            typing your password. The options depend on your device.
          </p>
          <p>
            This creates a{" "}
            <strong className="font-semibold text-[#14214a]">passkey</strong> —
            a secure sign-in saved by your device or password manager.
            RocketRota never receives your face or fingerprint data. You can
            still use your password.
          </p>
        </div>
        <div>
          <label htmlFor="device-sign-in-name" className="mb-2 block text-xs font-semibold text-[#14214a]">
            Name for this sign-in (optional)
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="device-sign-in-name"
              value={name}
              maxLength={80}
              placeholder="e.g. My iPhone"
              aria-label="Name for this sign-in (optional)"
              onChange={(event) => setName(event.target.value)}
            />
            <Button
              type="button"
              className="sm:shrink-0"
              disabled={!isSupported || addMutation.isPending}
              onClick={() => addMutation.mutate()}
            >
              <PlusIcon />
              {addMutation.isPending
                ? "Setting up..."
                : "Set up on this device"}
            </Button>
          </div>
        </div>
        <p className="text-[11px] leading-5 text-[#7180a2]">
          Your device will guide you through setup and ask you to confirm it is
          you.
        </p>
        <PasskeySupportMessage support={passkeySupport} />

        {passkeysQuery.isError ? (
          <div role="alert" className="text-xs text-destructive">
            We could not load your saved sign-ins.
            <Button
              type="button"
              variant="link"
              onClick={() => void passkeysQuery.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : (
          <PasskeyList
            passkeys={passkeysQuery.data ?? []}
            isLoading={passkeysQuery.isPending}
          />
        )}
      </div>
    </SettingsSection>
  )
}

function PasskeySupportMessage({
  support,
}: {
  support: PasskeySupport
}) {
  if (support === "checking" || support === "supported") return null

  return (
    <p className="text-sm text-muted-foreground">
      {support === "insecure"
        ? "Open RocketRota at its secure website address to set up device sign-in."
        : "Device sign-in is not available in this browser. Try an updated browser or another device. You can still sign in with your password."}
    </p>
  )
}

function PasskeyList({
  passkeys,
  isLoading,
}: {
  passkeys: Array<Passkey>
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading saved sign-ins...</p>
    )
  }

  if (passkeys.length === 0) {
    return (
      <div className="text-xs text-[#7180a2]">
        No saved sign-ins yet. Choose “Set up on this device” to get started.
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/70 border-y border-border/70">
      {passkeys.map((passkey) => (
        <PasskeyRow key={passkey.id} passkey={passkey} />
      ))}
    </div>
  )
}

export { PasskeyCard }
