"use client"

import { useState } from "react"
import type React from "react"
import { useServerFn } from "@tanstack/react-start"
import { SettingsIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { startBillingPortal } from "@/features/billing/server-fns"
import { showErrorToast } from "@/lib/toast"

type BillingPortalButtonProps = {
  organizationId?: string | null
  locationId?: string | null
  className?: string
  children?: React.ReactNode
}

function BillingPortalButton({
  organizationId,
  locationId,
  className,
  children = "Manage billing",
}: BillingPortalButtonProps) {
  const [isOpening, setIsOpening] = useState(false)
  const startPortal = useServerFn(startBillingPortal)

  async function handleClick() {
    setIsOpening(true)

    try {
      const result = await startPortal({
        data: {
          organizationId: organizationId ?? undefined,
          locationId: locationId ?? undefined,
          returnPath: window.location.pathname,
        },
      })

      window.location.assign(result.portalUrl)
    } catch (error) {
      setIsOpening(false)
      showErrorToast(error, {
        fallbackMessage: "We could not open billing management.",
      })
    }
  }

  return (
    <Button
      variant="outline"
      className={className}
      disabled={isOpening}
      onClick={() => {
        void handleClick()
      }}
    >
      <SettingsIcon className="size-3.5" />
      {isOpening ? "Opening..." : children}
    </Button>
  )
}

export { BillingPortalButton }
