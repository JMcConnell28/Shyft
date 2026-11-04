"use client"

import { Button } from "@/components/ui/button"
import {
  DataTable,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { useBillingMutations } from "@/features/billing/hooks/use-billing-mutations"
import { useBillingQuery } from "@/features/billing/hooks/use-billing-query"
import { formatDateTime } from "@/lib/utils"
import { PaymentRiskReviews } from "@/features/billing/components/payment-risk-reviews"

function BillingPage() {
  const query = useBillingQuery()
  const { extendTrialMutation } = useBillingMutations()

  if (query.isPending)
    return <p role="status">Loading billing information...</p>
  if (query.isError)
    return (
      <p role="alert">
        Billing information is unavailable. Refresh to try again.
      </p>
    )

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Billing and trials
        </h1>
        <p className="text-sm text-slate-500">
          Inspect location billing state and extend trial access.
        </p>
      </header>
      {query.data.reconciliation.needsAttention ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm"
        >
          Billing recovery needs attention. Last job:{" "}
          {query.data.reconciliation.lastStatus ?? "never run"}. Check the
          scheduled job, reconcile failures and confirm a successful run.
        </p>
      ) : null}
      <PaymentRiskReviews risks={query.data.risks} />
      <DataTable>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Location</TableHeaderCell>
            <TableHeaderCell>Billing</TableHeaderCell>
            <TableHeaderCell>Trial ends</TableHeaderCell>
            <TableHeaderCell>Action</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          {query.data.locations.map((location) => (
            <TableRow key={location.locationId}>
              <TableCell label="Location">
                <p className="font-medium">{location.locationName}</p>
                <p className="text-xs text-slate-500">
                  {location.organizationName ?? "Standalone"}
                </p>
              </TableCell>
              <TableCell label="Billing">
                <StatusBadge>{location.billingStatus ?? "unknown"}</StatusBadge>
              </TableCell>
              <TableCell label="Trial ends">
                {formatDateTime(location.trialEndsAt)}
              </TableCell>
              <TableCell label="Action">
                <Button
                  onClick={() =>
                    extendTrialMutation.mutate({
                      days: 7,
                      locationId: location.locationId,
                      reason: "Admin support extension",
                    })
                  }
                  variant="secondary"
                >
                  Extend 7 days
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}

export { BillingPage }
