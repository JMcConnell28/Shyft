"use client"
import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { getErrorMessage } from "@/lib/errors"
import { showErrorToast, showSuccessToast } from "@/lib/toast"
import { updateAccountProfile } from "@/features/account/server-fns"
import { useRefreshNavigation } from "@/features/navigation/hooks/use-refresh-navigation"

function useAccountProfile(initialName: string) {
  const refreshNavigation = useRefreshNavigation()
  const updateProfileFn = useServerFn(updateAccountProfile)
  const [name, setName] = React.useState(initialName)
  const [error, setError] = React.useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () =>
      updateProfileFn({
        data: {
          name: name.trim(),
        },
      }),
    onSuccess: async () => {
      setError(null)
      await refreshNavigation()
      showSuccessToast("Profile updated.")
    },
    onError: (mutationError) => {
      const message = getErrorMessage(
        mutationError,
        "We could not update your profile."
      )
      setError(message)
      showErrorToast(mutationError, {
        fallbackMessage: message,
      })
    },
  })

  return { name, setName, error, mutation }
}

export { useAccountProfile }
