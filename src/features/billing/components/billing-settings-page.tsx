"use client"

import {
  CalendarClockIcon,
  CreditCardIcon,
  ReceiptTextIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckoutButton } from "@/features/billing/components/checkout-button"
import { BillingPortalButton } from "@/features/billing/components/billing-portal-button"
import { TimeAttendanceAddonButton } from "@/features/billing/components/time-attendance-addon-button"
import { TrialTestingControls } from "@/features/billing/components/trial-testing-controls"
import type {
  OrganizationBillingLocationSummary,
  WorkspaceBillingState,
  WorkspaceTrial,
} from "@/features/billing/types"
import { getTrialDisplayState } from "@/features/billing/utils/trial-state"
import { PAST_DUE_GRACE_DAYS } from "@/features/billing/constants"

type BillingSettingsPageProps = {
  billing: WorkspaceBillingState | null
  trial: WorkspaceTrial | null
  organizationId?: string | null
  locationId?: string | null
  organizationLocations?: Array<OrganizationBillingLocationSummary>
}

function BillingSettingsPage({
  billing,
  trial,
  organizationId,
  locationId,
  organizationLocations = [],
}: BillingSettingsPageProps) {
  const trialState = getTrialDisplayState(trial)
  const status = getBillingStatus({ billing, trial })
  const canOpenPortal = Boolean(billing?.stripeCustomerId)
  const canStartCheckout =
    !billing?.hasActiveSubscription &&
    billing?.subscriptionStatus !== "past_due" &&
    !billing?.hasSavedPaymentMethod

  return (
    <div className="space-y-4">
      <TrialSettingsNotice
        billing={billing}
        organizationId={organizationId}
        locationId={locationId}
        trial={trial}
      />

      <Card className="border-border/70 bg-background/95 shadow-sm">
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm">Billing</CardTitle>
            <p className="text-xs text-muted-foreground">
              Manage the plan and payment method for this workspace.
            </p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-border/70 border-y border-border/70">
            <BillingMetric
              icon={CreditCardIcon}
              label="Plan"
              value={getPlanValue(billing)}
              description="£25/month including your first 10 active employees"
            />
            <BillingMetric
              icon={ShieldCheckIcon}
              label="Billable staff"
              value={getEmployeeValue(billing)}
              description={getEmployeeDescription(billing)}
            />
            <BillingMetric
              icon={ReceiptTextIcon}
              label="Payment method"
              value={billing?.hasSavedPaymentMethod ? "Saved" : "Not saved"}
              description={getPaymentMethodDescription(billing)}
            />
            <BillingMetric
              icon={ReceiptTextIcon}
              label="Trial"
              value={getTrialValue(trialState)}
              description={getTrialDescription(trialState)}
            />
            <BillingMetric
              icon={ShieldCheckIcon}
              label="Extra employees"
              value={getExtraEmployeeValue(billing)}
              description="£2.50 per active employee above the included allowance"
            />
            <BillingMetric
              icon={CalendarClockIcon}
              label="Time & Attendance"
              value={`${billing?.timeAttendanceQuantity ?? 0} employees`}
              description="£1 per active employee assigned to enabled locations"
            />
          </div>

          {billing?.locations.length ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Per-location estimate
              </p>
              {billing.locations.map((location) => (
                <div
                  key={location.locationId}
                  className="flex flex-col gap-3 rounded-xl border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {location.locationName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {location.employeeHighWaterCount} active staff assigned
                    </p>
                  </div>
                  {locationId === location.locationId ? (
                    <TimeAttendanceAddonButton
                      enabled={location.timeAttendanceEnabled}
                      status={location.timeAttendanceStatus}
                      cancelAt={location.timeAttendanceCancelAt}
                      hardwareEntitlementAvailable={
                        location.hardwareEntitlementAvailable
                      }
                      locationId={location.locationId}
                    />
                  ) : (
                    <Badge variant="outline">
                      {location.timeAttendanceEnabled
                        ? "Time & Attendance"
                        : "Core"}
                    </Badge>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Employee quantities are synced from active schedulable staff.
                Fixed fees are billed in advance. Plus VAT where applicable.
              </p>
            </div>
          ) : null}

          <div className="rounded-xl border border-border/70 bg-muted/10 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {status.title}
                </p>
                <p className="max-w-2xl text-xs text-muted-foreground">
                  {status.description}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                {canStartCheckout ? (
                  <CheckoutButton
                    organizationId={organizationId}
                    locationId={locationId}
                  >
                    {trialState?.isExpired
                      ? "Choose plan"
                      : "Add payment method"}
                  </CheckoutButton>
                ) : null}
                {canOpenPortal ? (
                  <BillingPortalButton
                    organizationId={organizationId}
                    locationId={locationId}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {organizationLocations.length > 0 ? (
        <Card className="border-border/70 bg-background/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">
              Organization billing overview
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Locations are included with the organisation plan. Time &
              Attendance can be enabled per location.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {organizationLocations.map((location) => (
              <div
                key={location.locationId}
                className="rounded-xl border border-border/70 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {location.locationName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {location.payerLabel}
                      {location.renewalDate
                        ? ` · renews ${formatDate(location.renewalDate)}`
                        : ""}
                    </p>
                  </div>
                  <Badge
                    variant={
                      location.accessState === "recovery"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {location.accessState}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {location.employeeHighWaterCount} active staff assigned
                  {location.timeAttendanceStatus
                    ? ` · Time & Attendance ${location.timeAttendanceStatus}`
                    : ""}
                </p>
                {location.transfer ? (
                  <p className="mt-2 text-xs font-medium text-primary">
                    Billing transfer scheduled for{" "}
                    {formatDate(location.transfer.effectiveAt)}
                  </p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function TrialSettingsNotice({
  billing,
  trial,
}: {
  billing: WorkspaceBillingState | null
  organizationId?: string | null
  locationId?: string | null
  trial: WorkspaceTrial | null
}) {
  const trialState = getTrialDisplayState(trial)

  if (!trialState || billing?.hasActiveSubscription) {
    return null
  }

  const title = billing?.hasSavedPaymentMethod
    ? "Payment method saved"
    : trialState.isExpired
      ? "Trial ended"
      : trialState.isEndingSoon
        ? "Trial ending soon"
        : "Trial active"
  const description = billing?.hasSavedPaymentMethod
    ? "No payment has been taken. The saved payment method will be used when the trial ends."
    : trialState.isExpired
      ? "Choose a plan to restore paid rota access for this workspace."
      : `This workspace has ${trialState.daysRemaining} day${trialState.daysRemaining === 1 ? "" : "s"} remaining. Add a payment method before ${formatDate(trialState.trialEndsAt)} to avoid interruption.`

  return (
    <Alert
      variant={trialState.isExpired ? "destructive" : "default"}
      className="items-start gap-x-3 rounded-xl border-border/70 bg-background p-4 shadow-sm"
    >
      <CalendarClockIcon className="size-4" />
      <div className="space-y-1">
        <AlertTitle className="text-sm">{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </div>
      {import.meta.env.DEV ? (
        <div className="col-span-2 mt-3">
          <TrialTestingControls trial={trialState} />
        </div>
      ) : null}
    </Alert>
  )
}

function BillingMetric({
  description,
  icon: Icon,
  label,
  value,
}: {
  description: string
  icon: typeof CreditCardIcon
  label: string
  value: string
}) {
  return (
    <div className="flex min-h-20 items-center gap-3 py-4 sm:gap-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <p className="shrink-0 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function getBillingStatus(input: {
  billing: WorkspaceBillingState | null
  trial: WorkspaceTrial | null
}) {
  const trialState = getTrialDisplayState(input.trial)

  if (input.billing?.subscriptionStatus === "past_due") {
    const graceEndsAt = input.billing.pastDueGraceEndsAt

    return {
      label: "Past due",
      title: input.billing.isPastDueGraceActive
        ? "Payment failed"
        : "Payment grace ended",
      description: input.billing.isPastDueGraceActive
        ? `Stripe could not collect the latest payment. Workspace access remains open during the ${PAST_DUE_GRACE_DAYS}-day grace period${graceEndsAt ? `, ending ${formatDate(graceEndsAt)}` : ""}.`
        : "Stripe could not collect payment and the grace period has ended. Update the payment method to restore access.",
      variant: "destructive" as const,
    }
  }

  if (input.billing?.subscriptionStatus === "unpaid") {
    return {
      label: "Unpaid",
      title: "Payment required",
      description:
        "The subscription is unpaid. Update the payment method in Stripe to restore access.",
      variant: "destructive" as const,
    }
  }

  if (input.billing?.subscriptionStatus === "canceled") {
    return {
      label: "Canceled",
      title: "Subscription canceled",
      description: "Choose a plan to restart billing for this workspace.",
      variant: "destructive" as const,
    }
  }

  if (input.billing?.subscriptionStatus === "incomplete_expired") {
    return {
      label: "Expired",
      title: "Checkout expired",
      description:
        "The previous checkout was not completed. Choose a plan to continue.",
      variant: "destructive" as const,
    }
  }

  if (input.billing?.hasActiveSubscription) {
    return {
      label: "Active",
      title: "Subscription active",
      description:
        "Billing is active for this workspace. Use Stripe billing management to update cards, invoices, and subscription details.",
      variant: "default" as const,
    }
  }

  if (input.billing?.hasSavedPaymentMethod) {
    return {
      label: "Card saved",
      title: "Payment method saved",
      description:
        "The saved payment method will be used when the trial ends. No payment has been taken yet.",
      variant: "secondary" as const,
    }
  }

  if (trialState?.isExpired) {
    return {
      label: "Expired",
      title: "Choose a plan to continue",
      description:
        "The trial has ended for this workspace. Add billing to restore paid rota access.",
      variant: "destructive" as const,
    }
  }

  return {
    label: "Trial",
    title: "Trial active",
    description:
      "Add a payment method before the trial ends to keep rota access uninterrupted.",
    variant: "outline" as const,
  }
}

function getPaymentMethodDescription(billing: WorkspaceBillingState | null) {
  if (!billing?.paymentMethodSavedAt) {
    return "Needed before paid access starts"
  }

  return `Saved ${formatDate(billing.paymentMethodSavedAt)}`
}

function getPlanValue(billing: WorkspaceBillingState | null) {
  const locationQuantity = billing?.locationQuantity ?? 0

  return `${locationQuantity} included location${locationQuantity === 1 ? "" : "s"}`
}

function getEmployeeValue(billing: WorkspaceBillingState | null) {
  return `${billing?.activeEmployeeQuantity ?? 0} counted`
}

function getEmployeeDescription(billing: WorkspaceBillingState | null) {
  const includedEmployeeQuantity = billing?.includedEmployeeQuantity ?? 10

  return `${includedEmployeeQuantity} included; archived staff are excluded`
}

function getExtraEmployeeValue(billing: WorkspaceBillingState | null) {
  const extraEmployeeQuantity = billing?.extraEmployeeQuantity ?? 0

  return `${extraEmployeeQuantity} billable`
}

function getTrialValue(trial: ReturnType<typeof getTrialDisplayState>) {
  if (!trial) {
    return "Not started"
  }

  if (trial.isExpired) {
    return "Ended"
  }

  return `${trial.daysRemaining} day${trial.daysRemaining === 1 ? "" : "s"} left`
}

function getTrialDescription(trial: ReturnType<typeof getTrialDisplayState>) {
  if (!trial) {
    return "Trial status is not available"
  }

  return `Ends ${formatDate(trial.trialEndsAt)}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export { BillingSettingsPage }
