"use client"

import { useState } from "react"
import type React from "react"
import { useServerFn } from "@tanstack/react-start"
import { CreditCardIcon } from "lucide-react"

import { startSubscriptionCheckout } from "@/features/billing/server-fns"
import { Button } from "@/components/ui/button"
import { showErrorToast } from "@/lib/toast"

type CheckoutButtonProps = {
  organizationId?: string | null
  locationId?: string | null
  className?: string
  children?: React.ReactNode
}

function CheckoutButton({
  organizationId,
  locationId,
  className,
  children = "Start subscription",
}: CheckoutButtonProps) {
  const [isStarting, setIsStarting] = useState(false)
  const startCheckout = useServerFn(startSubscriptionCheckout)

  async function handleClick() {
    setIsStarting(true)

    try {
      const result = await startCheckout({
        data: {
          organizationId: organizationId ?? undefined,
          locationId: locationId ?? undefined,
          returnPath: window.location.pathname,
        },
      })

      window.location.assign(result.checkoutUrl)
    } catch (error) {
      setIsStarting(false)
      showErrorToast(error, {
        fallbackMessage: "We could not start checkout.",
      })
    }
  }

  return (
    <Button
      className={className}
      disabled={isStarting}
      onClick={() => {
        void handleClick()
      }}
    >
      <CreditCardIcon className="size-3.5" />
      {isStarting ? "Opening checkout..." : children}
    </Button>
  )
}

export { CheckoutButton }
