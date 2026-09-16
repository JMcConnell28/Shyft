"use client"
import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { getErrorMessage } from "@/lib/errors"
import { showErrorToast, showSuccessToast } from "@/lib/toast"
import { changeAccountPassword } from "@/features/account/server-fns"

function useAccountPassword() {
  const changePasswordFn = useServerFn(changeAccountPassword)
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () =>
      changePasswordFn({
        data: {
          currentPassword,
          newPassword,
          confirmPassword,
        },
      }),
    onSuccess: () => {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setError(null)
      showSuccessToast("Password changed.")
    },
    onError: (mutationError) => {
      const message = getErrorMessage(
        mutationError,
        "We could not change your password."
      )
      setError(message)
      showErrorToast(mutationError, {
        fallbackMessage: message,
      })
    },
  })

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    mutation,
  }
}

export { useAccountPassword }
