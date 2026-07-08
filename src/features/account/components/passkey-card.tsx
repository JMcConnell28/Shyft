"use client"

import type { Passkey } from "@better-auth/passkey"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FingerprintIcon, PlusIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasskeyRow } from "@/features/account/components/passkey-row"
import {
  listPasskeys,
  passkeyQueryKey,
} from "@/features/account/queries/passkey-queries"
import { usePasskeySupport } from "@/features/account/hooks/use-passkey-support"
import { authClient } from "@/lib/auth-client"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function PasskeyCard() {
  const queryClient = useQueryClient()
  const [name, setName] = React.useState("")
  const passkeySupport = usePasskeySupport()
  const isSupported = passkeySupport === "supported"
  const passkeysQuery = useQuery({
    queryKey: passkeyQueryKey,
    queryFn: listPasskeys,
  })
  const addMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.passkey.addPasskey({
        name: name.trim() || "My device",
        authenticatorAttachment: "platform",
      })

      if (result.error) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: async () => {
      setName("")
      await queryClient.invalidateQueries({ queryKey: passkeyQueryKey })
      showSuccessToast("Passkey added.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not add the passkey.",
      })
    },
  })

  return (
    <Card className="border-border/70 bg-background/95 shadow-sm xl:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FingerprintIcon className="size-4 text-muted-foreground" />
          <CardTitle className="text-sm">Passkeys</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={name}
            maxLength={80}
            placeholder="Passkey name, e.g. Work laptop"
            aria-label="Passkey name"
            onChange={(event) => setName(event.target.value)}
          />
          <Button
            type="button"
            className="sm:shrink-0"
            disabled={!isSupported || addMutation.isPending}
            onClick={() => addMutation.mutate()}
          >
            <PlusIcon />
            {addMutation.isPending ? "Adding..." : "Add passkey"}
          </Button>
        </div>

        <PasskeySupportMessage support={passkeySupport} />

        <PasskeyList
          passkeys={passkeysQuery.data ?? []}
          isLoading={passkeysQuery.isPending}
        />
      </CardContent>
    </Card>
  )
}

function PasskeySupportMessage({
  support,
}: {
  support: ReturnType<typeof usePasskeySupport>
}) {
  if (support === "checking" || support === "supported") return null

  return (
    <p className="text-sm text-muted-foreground">
      {support === "insecure"
        ? "Passkeys require HTTPS. Open RocketRota on its hosted HTTPS address rather than a local network IP address."
        : "Passkeys are unavailable in this browser. Check that Chrome and Google Play services are up to date."}
    </p>
  )
}

function PasskeyList({
  passkeys,
  isLoading,
}: {
  passkeys: Passkey[]
  isLoading: boolean
}) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading passkeys...</p>
  }

  if (passkeys.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
        No passkeys yet. Add one to sign in with your device PIN, fingerprint,
        or face recognition.
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
