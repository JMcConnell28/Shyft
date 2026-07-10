"use client"

import { TriangleAlertIcon } from "lucide-react"

import { BillingPortalButton } from "@/features/billing/components/billing-portal-button"
import { PAST_DUE_GRACE_DAYS } from "@/features/billing/constants"
import type { WorkspaceBillingState } from "@/features/billing/types"

type PastDueBillingNoticeProps = {
  billing: WorkspaceBillingState | null | undefined
  organizationId?: string | null
  locationId?: string | null
}

function PastDueBillingNotice({
  billing,
  organizationId,
  locationId,
}: PastDueBillingNoticeProps) {
  if (
    billing?.subscriptionStatus !== "past_due" ||
    !billing.isPastDueGraceActive
  ) {
    return null
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Payment failed</p>
            <p className="text-xs leading-5 text-amber-900/80">
              Workspace access remains open during the {PAST_DUE_GRACE_DAYS}-day
              grace period
              {billing.pastDueGraceEndsAt
                ? `, ending ${formatDate(billing.pastDueGraceEndsAt)}`
                : ""}
              . Update billing to avoid interruption.
            </p>
          </div>
        </div>
        {billing.stripeCustomerId ? (
          <BillingPortalButton
            className="w-full md:w-auto"
            organizationId={organizationId}
            locationId={locationId}
          />
        ) : null}
      </div>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export { PastDueBillingNotice }
