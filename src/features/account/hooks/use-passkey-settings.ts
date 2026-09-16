"use client"
import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  listPasskeys,
  passkeyQueryKey,
} from "@/features/account/queries/passkey-queries"
import { usePasskeySupport } from "@/features/account/hooks/use-passkey-support"
import { authClient } from "@/lib/auth-client"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function usePasskeySettings() {
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
      showSuccessToast("Face, fingerprint or PIN sign-in is ready.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage:
          "We could not set up device sign-in. Please try again.",
      })
    },
  })

  return {
    name,
    setName,
    passkeySupport,
    isSupported,
    passkeysQuery,
    addMutation,
  }
}
export { usePasskeySettings }
