import * as React from "react"
import { useNavigate } from "@tanstack/react-router"

import { authClient } from "@/lib/auth-client"
import { getAdminAuthStatus } from "@/features/auth/server-fns"

function useAdminLogin() {
  const navigate = useNavigate()
  const [mode, setMode] = React.useState<"password" | "totp" | "backup">(
    "password"
  )
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  async function submit(form: FormData): Promise<void> {
    setPending(true)
    setError(null)
    try {
      const result =
        mode === "password"
          ? await authClient.signIn.email({
              email: String(form.get("email") ?? "").trim(),
              password: String(form.get("password") ?? ""),
            })
          : mode === "totp"
            ? await authClient.twoFactor.verifyTotp({
                code: String(form.get("code") ?? ""),
                trustDevice: false,
              })
            : await authClient.twoFactor.verifyBackupCode({
                code: String(form.get("code") ?? ""),
                trustDevice: false,
              })
      if (result.error) {
        setError(result.error.message ?? "We could not verify your sign-in.")
        return
      }
      if (
        mode === "password" &&
        "twoFactorRedirect" in result.data &&
        result.data.twoFactorRedirect
      ) {
        setMode("totp")
        return
      }
      const status = await getAdminAuthStatus()
      await navigate({
        to: status.needsTwoFactorSetup ? "/security-setup" : "/dashboard",
      })
    } catch {
      setError("We could not complete sign-in. Please try again.")
    } finally {
      setPending(false)
    }
  }
  return { mode, setMode, error, pending, submit }
}

export { useAdminLogin }
