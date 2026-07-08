"use client"

import * as React from "react"

type PasskeySupport = "checking" | "insecure" | "supported" | "unsupported"

function usePasskeySupport(): PasskeySupport {
  const [support, setSupport] = React.useState<PasskeySupport>("checking")

  React.useEffect(() => {
    if (!window.isSecureContext) {
      setSupport("insecure")
      return
    }

    const supportsWebAuthn =
      "PublicKeyCredential" in window &&
      "credentials" in navigator &&
      typeof navigator.credentials.create === "function"

    setSupport(supportsWebAuthn ? "supported" : "unsupported")
  }, [])

  return support
}

export { usePasskeySupport }
export type { PasskeySupport }
