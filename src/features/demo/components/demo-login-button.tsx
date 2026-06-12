"use client"

import * as React from "react"
import { useServerFn } from "@tanstack/react-start"
import { SparklesIcon } from "lucide-react"

import { prepareDemoAccount } from "@/features/demo/server-fns"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

type DemoLoginButtonProps = {
  disabled?: boolean
  onError: (message: string | null) => void
}

function DemoLoginButton({ disabled, onError }: DemoLoginButtonProps) {
  const [isPending, setIsPending] = React.useState(false)
  const prepareDemoAccountFn = useServerFn(prepareDemoAccount)

  async function handleDemoLogin() {
    setIsPending(true)
    onError(null)

    try {
      const demo = await prepareDemoAccountFn()
      const result = await authClient.signIn.email({
        email: demo.email,
        password: demo.password,
        callbackURL: demo.redirectTo,
      })

      if (result.error) {
        onError(result.error.message ?? "Unable to open the demo account.")
        return
      }

      window.location.href = demo.redirectTo
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Unable to open the demo account.",
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      variant="secondary"
      size="lg"
      className="w-full"
      type="button"
      onClick={() => void handleDemoLogin()}
      disabled={disabled || isPending}
    >
      <SparklesIcon className="size-4" />
      {isPending ? "Preparing demo..." : "Try demo workspace"}
    </Button>
  )
}

export { DemoLoginButton }
