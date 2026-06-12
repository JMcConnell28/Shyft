import { Link, createFileRoute, getRouteApi, redirect } from "@tanstack/react-router"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  ReceiptTextIcon,
} from "lucide-react"

import { BrandLockup } from "@/components/app/brand"
import { BillingPortalButton } from "@/features/billing/components/billing-portal-button"
import { CheckoutButton } from "@/features/billing/components/checkout-button"
import { TrialTestingControls } from "@/features/billing/components/trial-testing-controls"
import { hasPaidWorkspaceAccess } from "@/features/billing/utils/billing-access"
import { getTrialDisplayState } from "@/features/billing/utils/trial-state"
import { PAST_DUE_GRACE_DAYS } from "@/features/billing/constants"
import type { WorkspaceBillingState } from "@/features/billing/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getLocationDashboardPath,
  getOrganizationDashboardPath,
  getWorkspaceAccountPath,
} from "@/lib/organization-paths"

const verifiedRouteApi = getRouteApi("/_authed/_verified")

type BillingBlockedAction = "choose-plan" | "update-payment-method" | "manage-billing"

type BillingBlockedState = {
  label: string
  title: string
  description: string
  detailTitle: string
  detailDescription: string
  action: BillingBlockedAction
  iconTone: "amber" | "red" | "green"
  canGoBack: boolean
}

export const Route = createFileRoute("/_authed/_verified/billing/expired")({
  beforeLoad: ({ context }) => {
    if (!context.viewer.activeWorkspace) {
      throw redirect({ to: "/onboarding/setup" })
    }
  },
  head: () => ({
    meta: [
      { title: "Trial Ended | RocketRota" },
      {
        name: "description",
        content: "Your RocketRota trial has ended. Add billing to continue.",
      },
    ],
  }),
  component: BillingExpiredRoute,
})

function BillingExpiredRoute() {
  const { viewer } = verifiedRouteApi.useRouteContext()
  const workspace = viewer.activeWorkspace
  const trialState = getTrialDisplayState(viewer.trial)
  const hasSubscription = hasPaidWorkspaceAccess(viewer.billing)
  const canOpenPortal = Boolean(viewer.billing?.stripeCustomerId)
  const blockedState = getBillingBlockedState({
    billing: viewer.billing,
    canOpenPortal,
    hasSubscription,
    workspaceName: workspace?.name ?? "This workspace",
  })
  const dashboardHref =
    workspace?.type === "location"
      ? getLocationDashboardPath(workspace.slug)
      : workspace
        ? getOrganizationDashboardPath(workspace.slug)
        : "/dashboard"
  const accountHref = workspace ? getWorkspaceAccountPath(workspace.slug) : "/account"

  return (
    <main className="min-h-svh bg-muted/20 px-4 py-5 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100svh-2.5rem)] w-full max-w-xl flex-col">
        <div className="flex items-center justify-between">
          <BrandLockup compact />
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link to={accountHref} />}
          >
            Account
          </Button>
        </div>

        <div className="flex flex-1 items-center py-8">
          <Card className="w-full border-border/70 bg-background shadow-sm">
            <CardHeader className="space-y-4">
              <div
                className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 data-[tone=green]:bg-emerald-100 data-[tone=green]:text-emerald-700 data-[tone=red]:bg-red-100 data-[tone=red]:text-red-700"
                data-tone={blockedState.iconTone}
              >
                {blockedState.iconTone === "green" ? (
                  <CheckCircle2Icon className="size-5" />
                ) : (
                  <AlertTriangleIcon className="size-5" />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {blockedState.label}
                </p>
                <CardTitle className="text-2xl">{blockedState.title}</CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">
                  {blockedState.description}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  {blockedState.action === "choose-plan" ? (
                    <CreditCardIcon className="mt-0.5 size-4 text-muted-foreground" />
                  ) : (
                    <ReceiptTextIcon className="mt-0.5 size-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {blockedState.detailTitle}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {blockedState.detailDescription}
                    </p>
                  </div>
                </div>
              </div>

              {trialState ? <TrialTestingControls trial={trialState} /> : null}

              <div className="flex flex-col gap-2 sm:flex-row">
                {blockedState.action === "choose-plan" ? (
                  <CheckoutButton
                    className="w-full sm:w-auto"
                    organizationId={workspace?.type === "organization" ? workspace.id : null}
                    locationId={workspace?.type === "location" ? workspace.id : null}
                  >
                    Choose plan
                  </CheckoutButton>
                ) : blockedState.action === "update-payment-method" ? (
                  <BillingPortalButton
                    className="w-full sm:w-auto"
                    organizationId={workspace?.type === "organization" ? workspace.id : null}
                    locationId={workspace?.type === "location" ? workspace.id : null}
                  >
                    Update payment method
                  </BillingPortalButton>
                ) : (
                  <BillingPortalButton
                    className="w-full sm:w-auto"
                    organizationId={workspace?.type === "organization" ? workspace.id : null}
                    locationId={workspace?.type === "location" ? workspace.id : null}
                  />
                )}
                {blockedState.canGoBack ? (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    nativeButton={false}
                    render={<Link to={dashboardHref} />}
                  >
                    Back to workspace
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

function getBillingBlockedState(input: {
  billing: WorkspaceBillingState | null
  canOpenPortal: boolean
  hasSubscription: boolean
  workspaceName: string
}): BillingBlockedState {
  const status = input.billing?.subscriptionStatus

  if (input.hasSubscription) {
    return {
      label: "Billing active",
      title: "Subscription active",
      description: `${input.workspaceName} has an active subscription. You can return to the workspace.`,
      detailTitle: "Billing management",
      detailDescription:
        "Open Stripe billing management to update payment details, invoices, or subscription settings.",
      action: input.canOpenPortal ? "manage-billing" : "choose-plan",
      iconTone: "green",
      canGoBack: true,
    }
  }

  if (status === "past_due") {
    return {
      label: "Payment failed",
      title: "Payment needs attention",
      description: `Stripe could not collect payment and the ${PAST_DUE_GRACE_DAYS}-day grace period has ended. Update the payment method to restore access.`,
      detailTitle: input.canOpenPortal
        ? "Update payment method"
        : "Choose plan",
      detailDescription: input.canOpenPortal
        ? "Open Stripe billing management to update the failed card or retry the latest invoice."
        : "Stripe billing management is not available yet. Choose a plan to restart billing for this workspace.",
      action: input.canOpenPortal ? "update-payment-method" : "choose-plan",
      iconTone: "red",
      canGoBack: false,
    }
  }

  if (status === "unpaid") {
    return {
      label: "Subscription unpaid",
      title: "Payment is required",
      description: `${input.workspaceName} has an unpaid subscription. Update the payment method or pay the outstanding invoice to restore access.`,
      detailTitle: input.canOpenPortal
        ? "Resolve unpaid invoice"
        : "Choose plan",
      detailDescription: input.canOpenPortal
        ? "Open Stripe billing management to update payment details and resolve the unpaid subscription."
        : "Stripe billing management is not available yet. Choose a plan to restart billing for this workspace.",
      action: input.canOpenPortal ? "update-payment-method" : "choose-plan",
      iconTone: "red",
      canGoBack: false,
    }
  }

  if (status === "canceled") {
    return {
      label: "Subscription canceled",
      title: "Choose a plan to continue",
      description: `${input.workspaceName} has a canceled subscription. Start a new subscription to restore rota access.`,
      detailTitle: "Restart subscription",
      detailDescription:
        "Choose a plan and complete Stripe Checkout to restart billing for this workspace.",
      action: "choose-plan",
      iconTone: "amber",
      canGoBack: false,
    }
  }

  if (status === "incomplete_expired") {
    return {
      label: "Checkout expired",
      title: "Choose a plan to continue",
      description: `${input.workspaceName} does not have an active subscription because the previous checkout was not completed.`,
      detailTitle: "Stripe Checkout",
      detailDescription:
        "Choose a plan and complete Stripe Checkout to activate billing for this workspace.",
      action: "choose-plan",
      iconTone: "amber",
      canGoBack: false,
    }
  }

  if (input.billing?.hasSavedPaymentMethod) {
    return {
      label: "No active subscription",
      title: "Billing setup needs finishing",
      description: `${input.workspaceName} has a saved payment method, but no active subscription. Choose a plan to restore access.`,
      detailTitle: "Choose plan",
      detailDescription:
        "Start Stripe Checkout to create the subscription. The saved customer details will still be available in Stripe.",
      action: "choose-plan",
      iconTone: "amber",
      canGoBack: false,
    }
  }

  return {
    label: "Trial ended",
    title: "Your trial has ended",
    description: `${input.workspaceName} needs an active subscription before managers can continue using rotas, settings, and team tools.`,
    detailTitle: "Stripe Checkout",
    detailDescription:
      "Choose a plan and complete Stripe Checkout to activate billing for this workspace.",
    action: "choose-plan",
    iconTone: "amber",
    canGoBack: false,
  }
}
