import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import type { z } from "zod"

import { authClient } from "@/lib/auth-client"
import { mfaSetupSchema } from "@/features/auth/schemas/mfa-schemas"

function useAdminMfaSetup() {
  const navigate = useNavigate()
  const [setup, setSetup] = React.useState<z.infer<
    typeof mfaSetupSchema
  > | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  async function submit(form: FormData): Promise<void> {
    setPending(true)
    setError(null)
    try {
      if (!setup) {
        const result = await authClient.twoFactor.enable({
          password: String(form.get("password") ?? ""),
          method: "totp",
        })
        if (result.error) {
          setError(
            result.error.message ?? "We could not start authenticator setup."
          )
          return
        }
        setSetup(mfaSetupSchema.parse(result.data))
      } else {
        const result = await authClient.twoFactor.verifyTotp({
          code: String(form.get("code") ?? ""),
          trustDevice: false,
        })
        if (result.error) {
          setError(result.error.message ?? "We could not verify that code.")
          return
        }
        setSetup(null)
        await navigate({ to: "/dashboard" })
      }
    } catch {
      setError("We could not complete authenticator setup. Please try again.")
    } finally {
      setPending(false)
    }
  }
  return { setup, error, pending, submit }
}

export { useAdminMfaSetup }
