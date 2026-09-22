import * as React from "react"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { showErrorToast } from "@/lib/toast"

function SignOutButton({ className }: { className?: string }) {
  const [isSigningOut, setIsSigningOut] = React.useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)

    try {
      const result = await authClient.signOut()

      if (result.error) {
        showErrorToast(result.error, { fallbackMessage: "We could not log you out." })
        setIsSigningOut(false)
        return
      }

      window.location.assign("/login")
    } catch (error) {
      showErrorToast(error, { fallbackMessage: "We could not log you out." })
      setIsSigningOut(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => void handleSignOut()}
      disabled={isSigningOut}
    >
      {isSigningOut ? "Signing out..." : "Log out"}
    </Button>
  )
}

export { SignOutButton }
