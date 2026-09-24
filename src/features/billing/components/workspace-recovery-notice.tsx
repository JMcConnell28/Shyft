import { TriangleAlertIcon } from "lucide-react"

import type {
  WorkspaceBillingState,
  WorkspaceTrial,
} from "@/features/billing/types"
import { BillingPortalButton } from "@/features/billing/components/billing-portal-button"
import { CheckoutButton } from "@/features/billing/components/checkout-button"
import { isWorkspaceBillingBlocked } from "@/features/billing/utils/billing-access"

type WorkspaceRecoveryNoticeProps = {
  billing: WorkspaceBillingState | null
  trial: WorkspaceTrial | null
  isManager: boolean
  canManageBilling: boolean
  organizationId: string | null
  locationId: string | null
}

function WorkspaceRecoveryNotice({
  billing,
  trial,
  isManager,
  canManageBilling,
  organizationId,
  locationId,
}: WorkspaceRecoveryNoticeProps) {
  if (!isWorkspaceBillingBlocked({ billing, trial })) return null

  const isMissedPayment =
    billing?.subscriptionStatus === "past_due" ||
    billing?.subscriptionStatus === "unpaid" ||
    billing?.subscriptionStatus === "incomplete_expired"
  const canOpenBillingPortal =
    Boolean(billing?.stripeCustomerId) &&
    (billing?.subscriptionStatus === "past_due" ||
      billing?.subscriptionStatus === "unpaid")
  const managerDescription =
    "Existing rotas and timesheets remain available. New rotas, timesheet entries, edits, and clock-ins are paused. " +
    (canManageBilling
      ? "Restore access to resume work."
      : "Ask the workspace owner to update billing.")

  return (
    <div
      role="alert"
      className="border-b border-red-200 bg-red-50 px-4 py-3 text-red-950"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-red-700" />
          <div>
            <p className="text-sm font-semibold">
              {isManager
                ? isMissedPayment
                  ? "Payment overdue — workspace is view-only"
                  : "Trial expired — workspace is view-only"
                : "Workspace is temporarily view-only"}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-red-900/80">
              {isManager
                ? managerDescription
                : "You can still view existing information. Ask your manager if you need to make a change or clock in."}
            </p>
          </div>
        </div>
        {canManageBilling && canOpenBillingPortal ? (
          <BillingPortalButton
            organizationId={organizationId}
            locationId={locationId}
          />
        ) : canManageBilling ? (
          <CheckoutButton
            organizationId={organizationId}
            locationId={locationId}
          >
            Restore access
          </CheckoutButton>
        ) : null}
      </div>
    </div>
  )
}

export { WorkspaceRecoveryNotice }
