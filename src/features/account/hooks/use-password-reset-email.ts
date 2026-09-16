"use client"
import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { showErrorToast, showSuccessToast } from "@/lib/toast"
import { requestPasswordReset } from "@/features/account/server-fns"

function usePasswordResetEmail(email: string) {
  const requestPasswordResetFn = useServerFn(requestPasswordReset)
  const mutation = useMutation({
    mutationFn: () =>
      requestPasswordResetFn({
        data: {
          email,
          redirectTo:
            typeof window === "undefined"
              ? "/reset-password"
              : `${window.location.origin}/reset-password`,
        },
      }),
    onSuccess: () => {
      showSuccessToast("Password reset email sent.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not send a password reset email.",
      })
    },
  })

  return { mutation }
}

export { usePasswordResetEmail }
