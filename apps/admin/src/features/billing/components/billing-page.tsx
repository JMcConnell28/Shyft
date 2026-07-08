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

function BillingPage() {
  const query = useBillingQuery()
  const { extendTrialMutation } = useBillingMutations()

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
          {(query.data?.locations ?? []).map((location) => (
            <TableRow key={location.locationId}>
              <TableCell>
                <p className="font-medium">{location.locationName}</p>
                <p className="text-xs text-slate-500">
                  {location.organizationName ?? "Standalone"}
                </p>
              </TableCell>
              <TableCell>
                <StatusBadge>{location.billingStatus ?? "unknown"}</StatusBadge>
              </TableCell>
              <TableCell>{formatDateTime(location.trialEndsAt)}</TableCell>
              <TableCell>
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
