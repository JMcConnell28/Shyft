"use client"

import { LoaderCircleIcon, SettingsIcon } from "lucide-react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { useBillingPortal } from "@/features/billing/hooks/use-billing-portal"

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
  const { isOpening, openPortal } = useBillingPortal({
    organizationId,
    locationId,
  })

  return (
    <Button
      variant="outline"
      className={className}
      disabled={isOpening}
      aria-busy={isOpening}
      onClick={() => {
        void openPortal()
      }}
    >
      {isOpening ? (
        <LoaderCircleIcon
          className="size-3.5 animate-spin"
          aria-hidden="true"
        />
      ) : (
        <SettingsIcon className="size-3.5" />
      )}
      {isOpening ? <span role="status">Opening Stripe...</span> : children}
    </Button>
  )
}

export { BillingPortalButton }
