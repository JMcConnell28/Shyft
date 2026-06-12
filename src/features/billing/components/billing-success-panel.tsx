"use client"

import { Link } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import {
  CheckCircle2Icon,
  ClockIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { BillingPortalButton } from "@/features/billing/components/billing-portal-button"
import { getWorkspaceBillingStatus } from "@/features/billing/server-fns"
import type { WorkspaceBillingState } from "@/features/billing/types"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/errors"

type ConfirmationState = "checking" | "active" | "pending" | "failed"

type BillingSuccessPanelProps = {
  checkoutSessionId?: string
  dashboardHref: string
  initialBilling: WorkspaceBillingState | null
  organizationId?: string | null
  locationId?: string | null
}

function BillingSuccessPanel({
  checkoutSessionId,
  dashboardHref,
  initialBilling,
  organizationId,
  locationId,
}: BillingSuccessPanelProps) {
  const [billing, setBilling] = useState(initialBilling)
  const [status, setStatus] = useState<ConfirmationState>(
    initialBilling?.hasActiveSubscription || initialBilling?.hasSavedPaymentMethod
      ? "active"
      : "checking",
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const getStatus = useServerFn(getWorkspaceBillingStatus)
  const content = useMemo(
    () => getStatusContent(status, billing),
    [billing, status],
  )

  useEffect(() => {
    let isMounted = true
    let attempts = 0
    let timeoutId: number | null = null

    async function checkBillingStatus() {
      attempts += 1

      try {
        const nextBilling = await getStatus({
          data: {
            organizationId: organizationId ?? undefined,
            locationId: locationId ?? undefined,
            checkoutSessionId: attempts === 1 ? checkoutSessionId : undefined,
          },
        })

        if (!isMounted) {
          return
        }

        setBilling(nextBilling)

        if (
          nextBilling?.hasActiveSubscription ||
          nextBilling?.hasSavedPaymentMethod
        ) {
          setStatus("active")
          return
        }

        if (attempts >= 10) {
          setStatus("pending")
          return
        }

        timeoutId = window.setTimeout(checkBillingStatus, 2000)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(getErrorMessage(error, "We could not confirm billing."))
        setStatus(attempts >= 3 ? "failed" : "checking")

        if (attempts < 3) {
          timeoutId = window.setTimeout(checkBillingStatus, 2000)
        }
      }
    }

    void checkBillingStatus()

    return () => {
      isMounted = false

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [checkoutSessionId, getStatus, locationId, organizationId])

  return (
    <div className="space-y-5">
      <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 data-[state=checking]:bg-blue-100 data-[state=checking]:text-blue-700 data-[state=failed]:bg-red-100 data-[state=failed]:text-red-700 data-[state=pending]:bg-amber-100 data-[state=pending]:text-amber-700" data-state={status}>
        {content.icon}
      </div>

      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-medium">{content.title}</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {content.description}
        </p>
        {errorMessage ? (
          <p className="text-sm leading-6 text-destructive">{errorMessage}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          disabled={status !== "active"}
          nativeButton={false}
          render={<Link to={dashboardHref} />}
        >
          Back to workspace
        </Button>
        {billing?.stripeCustomerId ? (
          <BillingPortalButton
            organizationId={organizationId}
            locationId={locationId}
          />
        ) : null}
      </div>
    </div>
  )
}

function getStatusContent(
  status: ConfirmationState,
  billing: WorkspaceBillingState | null,
) {
  if (status === "active") {
    if (billing?.hasSavedPaymentMethod && !billing.hasActiveSubscription) {
      return {
        icon: <CheckCircle2Icon className="size-5" />,
        title: "Payment method saved",
        description:
          "No payment has been taken. Your first charge will happen when the RocketRota trial ends.",
      }
    }

    if (billing?.subscriptionStatus === "trialing") {
      return {
        icon: <CheckCircle2Icon className="size-5" />,
        title: "Payment method saved",
        description:
          "Your subscription is ready and the first charge will happen when the RocketRota trial ends.",
      }
    }

    return {
      icon: <CheckCircle2Icon className="size-5" />,
      title: "Subscription active",
      description:
        "Stripe has confirmed the subscription and RocketRota access is unlocked.",
    }
  }

  if (status === "pending") {
    return {
      icon: <ClockIcon className="size-5" />,
      title: "Still confirming",
      description:
        "We are still waiting for Stripe's confirmation. This usually resolves after a refresh.",
    }
  }

  if (status === "failed") {
    return {
      icon: <TriangleAlertIcon className="size-5" />,
      title: "Could not confirm billing",
      description:
        "The payment may have completed, but RocketRota could not confirm the subscription yet.",
    }
  }

  return {
    icon: <ClockIcon className="size-5" />,
    title: "Confirming subscription",
    description:
      "Stripe redirected you back successfully. RocketRota is now confirming the subscription before unlocking access.",
  }
}

export { BillingSuccessPanel }
