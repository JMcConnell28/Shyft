"use client"

import * as React from "react"
import { ArrowRightIcon, Building2Icon, CreditCardIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { ConnectionBillingChoice } from "@/features/settings/components/connection-billing-choice"
import { ConnectionConfirmDialog } from "@/features/settings/components/connection-confirm-dialog"
import type {
  WorkspaceConnectionLocation,
  WorkspaceConnectionOrganization,
} from "@/features/settings/types"

type BillingMode = "keep" | "organization"

type LocationOrganizationMoveCardProps = {
  actionLabel: string
  availableLocations?: Array<WorkspaceConnectionLocation>
  currentLocation?: WorkspaceConnectionLocation | null
  description: string
  fixedTargetOrganization?: WorkspaceConnectionOrganization | null
  isPending: boolean
  locationsLabel?: string
  organizations: Array<WorkspaceConnectionOrganization>
  onMove: (input: {
    billingMode: BillingMode
    locationId: string
    targetOrganizationId: string
  }) => Promise<unknown>
  title: string
}

function LocationOrganizationMoveCard({
  actionLabel,
  availableLocations = [],
  currentLocation,
  description,
  fixedTargetOrganization,
  isPending,
  locationsLabel = "Location",
  organizations,
  onMove,
  title,
}: LocationOrganizationMoveCardProps) {
  const selectableLocations = currentLocation ? [currentLocation] : availableLocations
  const destinationOrganizations = fixedTargetOrganization
    ? []
    : organizations.filter(
        (organization) => organization.id !== currentLocation?.organizationId,
      )
  const [selectedLocationId, setSelectedLocationId] = React.useState(
    selectableLocations.at(0)?.id ?? "",
  )
  const [selectedOrganizationId, setSelectedOrganizationId] = React.useState(
    fixedTargetOrganization?.id ??
      destinationOrganizations.at(0)?.id ??
      "",
  )
  const selectedLocation =
    selectableLocations.find((location) => location.id === selectedLocationId) ??
    null
  const selectedOrganization =
    fixedTargetOrganization ??
    destinationOrganizations.find(
      (organization) => organization.id === selectedOrganizationId,
    ) ??
    null
  const mustMoveBilling = selectedLocation?.canKeepBillingWhenMoved === false
  const [billingMode, setBillingMode] = React.useState<BillingMode>(
    mustMoveBilling ? "organization" : "keep",
  )
  const [isConfirming, setIsConfirming] = React.useState(false)

  React.useEffect(() => {
    if (mustMoveBilling) {
      setBillingMode("organization")
    }
  }, [mustMoveBilling])

  React.useEffect(() => {
    if (!selectableLocations.some((location) => location.id === selectedLocationId)) {
      setSelectedLocationId(selectableLocations.at(0)?.id ?? "")
    }
  }, [selectableLocations, selectedLocationId])

  React.useEffect(() => {
    if (
      fixedTargetOrganization ||
      destinationOrganizations.some(
        (organization) => organization.id === selectedOrganizationId,
      )
    ) {
      return
    }

    setSelectedOrganizationId(destinationOrganizations.at(0)?.id ?? "")
  }, [
    destinationOrganizations,
    fixedTargetOrganization,
    selectedOrganizationId,
  ])

  const canSubmit =
    Boolean(selectedLocation) &&
    Boolean(selectedOrganization) &&
    selectedLocation?.organizationId !== selectedOrganization?.id
  const billingSummary =
    billingMode === "organization"
      ? `${selectedOrganization?.name ?? "The organization"} will pay for this location.`
      : "The location keeps its current billing account."

  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-sm">{title}</CardTitle>
          <p className="text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline">Explicit approval</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectableLocations.length === 0 ||
        (!fixedTargetOrganization && destinationOrganizations.length === 0) ? (
          <p className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
            {getEmptyMoveMessage({
              hasLocations: selectableLocations.length > 0,
              isFixedOrganization: Boolean(fixedTargetOrganization),
            })}
          </p>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              {!currentLocation ? (
                <Field>
                  <FieldLabel>{locationsLabel}</FieldLabel>
                  <FieldContent>
                    <NativeSelect
                      value={selectedLocationId}
                      onChange={(event) => setSelectedLocationId(event.target.value)}
                    >
                      {selectableLocations.map((location) => (
                        <NativeSelectOption key={location.id} value={location.id}>
                          {location.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <FieldDescription>
                      Only locations where you are owner or admin appear here.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              ) : null}

              {!fixedTargetOrganization ? (
                <Field>
                  <FieldLabel>Destination organization</FieldLabel>
                  <FieldContent>
                    <NativeSelect
                      value={selectedOrganizationId}
                      onChange={(event) =>
                        setSelectedOrganizationId(event.target.value)
                      }
                    >
                      {destinationOrganizations.map((organization) => (
                        <NativeSelectOption
                          key={organization.id}
                          value={organization.id}
                        >
                          {organization.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <FieldDescription>
                      Only organizations where you are owner or admin appear here.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
              <ConnectionSummary
                icon={Building2Icon}
                label="Current"
                title={selectedLocation?.organizationName ?? "Standalone location"}
                detail={selectedLocation?.name ?? "Choose a location"}
              />
              <div className="hidden items-center justify-center text-muted-foreground md:flex">
                <ArrowRightIcon className="size-4" />
              </div>
              <ConnectionSummary
                icon={Building2Icon}
                label="Destination"
                title={selectedOrganization?.name ?? "Choose organization"}
                detail={billingSummary}
              />
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/10 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <CreditCardIcon className="size-4 text-muted-foreground" />
                Billing
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <ConnectionBillingChoice
                  checked={billingMode === "keep"}
                  disabled={mustMoveBilling}
                  label="Keep location billing"
                  description={
                    mustMoveBilling
                      ? "Unavailable because this location is currently paid by another organization."
                      : "Organisation membership changes, billing stays separate."
                  }
                  onClick={() => setBillingMode("keep")}
                />
                <ConnectionBillingChoice
                  checked={billingMode === "organization"}
                  label="Move to organization billing"
                  description="The destination organization covers this location."
                  onClick={() => setBillingMode("organization")}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                size="lg"
                disabled={!canSubmit || isPending}
                onClick={() => setIsConfirming(true)}
              >
                {actionLabel}
              </Button>
            </div>
          </>
        )}
      </CardContent>

      <ConnectionConfirmDialog
        isOpen={isConfirming}
        isPending={isPending}
        title="Review location move"
        description={`${selectedLocation?.name ?? "This location"} will move to ${
          selectedOrganization?.name ?? "the selected organization"
        }. ${billingSummary}`}
        confirmLabel="Confirm move"
        onOpenChange={setIsConfirming}
        onConfirm={() => {
          if (!selectedLocation || !selectedOrganization) {
            return
          }

          void onMove({
            billingMode,
            locationId: selectedLocation.id,
            targetOrganizationId: selectedOrganization.id,
          }).then(() => setIsConfirming(false))
        }}
      />
    </Card>
  )
}

function getEmptyMoveMessage(input: {
  hasLocations: boolean
  isFixedOrganization: boolean
}) {
  if (!input.hasLocations) {
    return "No available locations yet. Locations where you are owner or admin appear here."
  }

  if (input.isFixedOrganization) {
    return "No other eligible locations are available for this organization."
  }

  return "No other organizations are available yet. Create an organization first, or ask an organization owner to make you an admin."
}

function ConnectionSummary({
  detail,
  icon: Icon,
  label,
  title,
}: {
  detail: string
  icon: typeof Building2Icon
  label: string
  title: string
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  )
}

export { LocationOrganizationMoveCard }
