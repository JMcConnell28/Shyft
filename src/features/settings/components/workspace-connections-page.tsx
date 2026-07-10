"use client"

import { Building2Icon, GitMergeIcon, MapPinnedIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateOrganizationFromLocationCard } from "@/features/settings/components/create-organization-from-location-card"
import { LocationOrganizationMoveCard } from "@/features/settings/components/location-organization-move-card"
import { OrganizationBillingCentralizationCard } from "@/features/settings/components/organization-billing-centralization-card"
import { useWorkspaceConnectionMutations } from "@/features/settings/hooks/use-workspace-connection-mutations"
import { useWorkspaceConnectionsQuery } from "@/features/settings/hooks/use-workspace-connections-query"

type WorkspaceConnectionsPageProps = {
  organizationId?: string
  locationId?: string
  userId: string
}

function WorkspaceConnectionsPage({
  organizationId,
  locationId,
  userId,
}: WorkspaceConnectionsPageProps) {
  const connectionsQuery = useWorkspaceConnectionsQuery({
    organizationId,
    locationId,
    userId,
  })
  const mutations = useWorkspaceConnectionMutations()

  if (connectionsQuery.isPending) {
    return <ConnectionsState message="Loading workspace connections..." />
  }

  if (connectionsQuery.isError) {
    return (
      <ConnectionsState message="We could not load workspace connections right now." />
    )
  }

  const data = connectionsQuery.data

  return (
    <div className="space-y-4">
      <ConnectionsIntro />

      {locationId && data.currentLocation ? (
        <>
          {!data.currentLocation.organizationId ? (
            <CreateOrganizationFromLocationCard
              location={data.currentLocation}
              isPending={mutations.isCreatingOrganization}
              onCreate={mutations.createOrganizationFromLocation}
            />
          ) : null}

          {data.currentLocation.organizationId ||
          data.manageableOrganizations.length > 0 ? (
            <LocationOrganizationMoveCard
              title={
                data.currentLocation.organizationId
                  ? "Move organization"
                  : "Join existing organization"
              }
              description="Connect this location to an organization without changing billing unless you explicitly choose to."
              actionLabel={
                data.currentLocation.organizationId
                  ? "Move location"
                  : "Join organization"
              }
              currentLocation={data.currentLocation}
              organizations={data.manageableOrganizations}
              isPending={mutations.isMovingLocation}
              onMove={mutations.moveLocationToOrganization}
            />
          ) : null}
        </>
      ) : null}

      {organizationId && data.currentOrganization ? (
        <>
          <LocationOrganizationMoveCard
            title="Bring a location in"
            description={`Move a location you administer into ${data.currentOrganization.name}. Billing stays separate unless you choose organization billing.`}
            actionLabel="Move into organization"
            fixedTargetOrganization={data.currentOrganization}
            availableLocations={data.manageableLocations.filter(
              (location) => location.organizationId !== organizationId,
            )}
            organizations={data.manageableOrganizations}
            isPending={mutations.isMovingLocation}
            onMove={mutations.moveLocationToOrganization}
          />

          <OrganizationBillingCentralizationCard
            organization={data.currentOrganization}
            locations={data.organizationLocations}
            isPending={mutations.isMovingBilling}
            onMoveBilling={mutations.moveLocationToOrganizationBilling}
          />
        </>
      ) : null}
    </div>
  )
}

function ConnectionsIntro() {
  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg border border-border/70 text-muted-foreground">
          <GitMergeIcon className="size-4" />
        </div>
        <div>
          <CardTitle className="text-sm">Connections</CardTitle>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Move locations between organizations and choose whether billing stays
            separate or moves to organization billing.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-3">
          <ConnectionPrinciple
            icon={MapPinnedIcon}
            title="Location first"
            description="Rotas, staff, and history stay attached to the location."
          />
          <ConnectionPrinciple
            icon={Building2Icon}
            title="Organizations group"
            description="Joining an organization does not automatically change who pays."
          />
          <ConnectionPrinciple
            icon={GitMergeIcon}
            title="Billing is explicit"
            description="Moving billing recalculates Stripe quantities after confirmation."
          />
        </div>
      </CardContent>
    </Card>
  )
}

function ConnectionPrinciple({
  description,
  icon: Icon,
  title,
}: {
  description: string
  icon: typeof MapPinnedIcon
  title: string
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/10 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  )
}

function ConnectionsState({ message }: { message: string }) {
  return (
    <Alert className="rounded-xl border-border/70 bg-background p-4 shadow-sm">
      <GitMergeIcon className="size-4" />
      <AlertTitle>Connections</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export { WorkspaceConnectionsPage }
