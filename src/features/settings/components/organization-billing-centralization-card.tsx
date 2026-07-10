"use client"

import * as React from "react"
import { CreditCardIcon, MapPinnedIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectionConfirmDialog } from "@/features/settings/components/connection-confirm-dialog"
import type {
  WorkspaceConnectionLocation,
  WorkspaceConnectionOrganization,
} from "@/features/settings/types"

type OrganizationBillingCentralizationCardProps = {
  isPending: boolean
  locations: Array<WorkspaceConnectionLocation>
  organization: WorkspaceConnectionOrganization
  onMoveBilling: (input: {
    locationId: string
    organizationId: string
  }) => Promise<unknown>
}

function OrganizationBillingCentralizationCard({
  isPending,
  locations,
  organization,
  onMoveBilling,
}: OrganizationBillingCentralizationCardProps) {
  const separateBillingLocations = locations.filter((location) => {
    return (
      location.billingScope !== "organization" ||
      location.billingOrganizationId !== organization.id
    )
  })
  const [selectedLocation, setSelectedLocation] =
    React.useState<WorkspaceConnectionLocation | null>(null)

  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-sm">Centralize billing</CardTitle>
          <p className="text-xs leading-5 text-muted-foreground">
            Move selected locations onto {organization.name} billing after they
            have joined the organization.
          </p>
        </div>
        <Badge variant="secondary">
          {separateBillingLocations.length} separate
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {separateBillingLocations.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
            Every location in this organization is already covered by
            organization billing.
          </p>
        ) : (
          separateBillingLocations.map((location) => (
            <div
              key={location.id}
              className="flex flex-col gap-3 rounded-xl border border-border/70 bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="rounded-lg border border-border/70 p-2 text-muted-foreground">
                  <MapPinnedIcon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {location.name}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Current billing: {getBillingLabel(location)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setSelectedLocation(location)}
              >
                <CreditCardIcon className="size-3.5" />
                Move billing
              </Button>
            </div>
          ))
        )}
      </CardContent>

      <ConnectionConfirmDialog
        isOpen={Boolean(selectedLocation)}
        isPending={isPending}
        title="Move billing"
        description={`${selectedLocation?.name ?? "This location"} will be covered by ${
          organization.name
        } billing. Stripe quantities will be recalculated after the move.`}
        confirmLabel="Move billing"
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedLocation(null)
          }
        }}
        onConfirm={() => {
          if (!selectedLocation) {
            return
          }

          void onMoveBilling({
            locationId: selectedLocation.id,
            organizationId: organization.id,
          }).then(() => setSelectedLocation(null))
        }}
      />
    </Card>
  )
}

function getBillingLabel(location: WorkspaceConnectionLocation) {
  if (location.billingScope === "organization") {
    return location.organizationName
      ? `${location.organizationName} organization billing`
      : "Organization billing"
  }

  return "Location billing"
}

export { OrganizationBillingCentralizationCard }
