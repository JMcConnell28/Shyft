"use client"

import { LoaderCircleIcon, TriangleAlertIcon } from "lucide-react"

import type {
  RotaSettingsLocation,
  RotaSettingsZone,
} from "@/features/settings/types"
import { DeleteZoneDialog } from "@/features/settings/components/delete-zone-dialog"
import { RotaTemplatesSettingsCard } from "@/features/settings/components/rota-templates-settings-card"
import {
  CreateZoneDialog,
  EditZoneDialog,
} from "@/features/settings/components/zone-dialog"
import { useRotaSettingsQuery } from "@/features/settings/hooks/use-rota-settings-query"
import { useRotaTemplateSettingsMutations } from "@/features/settings/hooks/use-rota-template-settings-mutations"
import { useZoneSettingsMutations } from "@/features/settings/hooks/use-zone-settings-mutations"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { getErrorMessage } from "@/lib/errors"

function RotaSettingsPage({
  organizationId,
  locationId,
  userId,
}: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const settingsQuery = useRotaSettingsQuery({
    organizationId,
    locationId,
    userId,
  })
  const mutations = useZoneSettingsMutations({
    organizationId,
    locationId,
    userId,
  })
  const templateMutations = useRotaTemplateSettingsMutations({
    organizationId,
    locationId,
    userId,
  })

  if (settingsQuery.isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        <LoaderCircleIcon className="mr-2 size-4 animate-spin" />
        Loading rota settings...
      </div>
    )
  }

  if (settingsQuery.isError) {
    return (
      <Empty className="border border-dashed border-border/70 bg-muted/10 py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlertIcon className="size-4" />
          </EmptyMedia>
          <EmptyTitle>We could not load rota settings</EmptyTitle>
          <EmptyDescription>
            {getErrorMessage(
              settingsQuery.error,
              "We could not load your zones right now."
            )}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (settingsQuery.data.locations.length === 0) {
    return (
      <Empty className="border border-dashed border-border/70 bg-muted/10 py-10">
        <EmptyHeader>
          <EmptyTitle>No locations yet</EmptyTitle>
          <EmptyDescription>
            Add a location first, then you can manage its rota zones here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const isBusy =
    mutations.createMutation.isPending ||
    mutations.updateMutation.isPending ||
    mutations.deleteMutation.isPending
  const isTemplateBusy =
    templateMutations.renameMutation.isPending ||
    templateMutations.deleteMutation.isPending

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        {settingsQuery.data.locations.map((location) => (
          <RotaLocationCard
            key={location.id}
            location={location}
            isBusy={isBusy}
            onCreate={async (name) => {
              await mutations.createMutation.mutateAsync({
                locationId: location.id,
                name,
              })
            }}
            onUpdate={async (zoneId, name) => {
              await mutations.updateMutation.mutateAsync({
                zoneId,
                name,
              })
            }}
            onDelete={async (zoneId) => {
              await mutations.deleteMutation.mutateAsync(zoneId)
            }}
          />
        ))}

        <RotaTemplatesSettingsCard
          pending={isTemplateBusy}
          templates={settingsQuery.data.templates}
          showLocationName={settingsQuery.data.locations.length > 1}
          onRename={async (templateId, name) => {
            await templateMutations.renameMutation.mutateAsync({
              templateId,
              name,
            })
          }}
          onDelete={async (templateId) => {
            await templateMutations.deleteMutation.mutateAsync(templateId)
          }}
        />
      </div>
    </div>
  )
}

function RotaLocationCard({
  location,
  isBusy,
  onCreate,
  onUpdate,
  onDelete,
}: {
  location: RotaSettingsLocation
  isBusy: boolean
  onCreate: (name: string) => Promise<void>
  onUpdate: (zoneId: string, name: string) => Promise<void>
  onDelete: (zoneId: string) => Promise<void>
}) {
  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-sm">{location.name}</CardTitle>
            <Badge variant="outline">
              {location.zones.length} zone
              {location.zones.length === 1 ? "" : "s"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Keep at least one zone on each location so shifts always have
            somewhere to live.
          </p>
        </div>

        <CreateZoneDialog
          pending={isBusy}
          onSubmit={async ({ name }) => {
            await onCreate(name)
          }}
        />
      </CardHeader>

      <CardContent className="divide-y divide-border/70 py-0!">
        {location.zones.map((zone) => (
          <ZoneRow
            key={zone.id}
            zone={zone}
            disableDelete={location.zones.length <= 1}
            pending={isBusy}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </CardContent>
    </Card>
  )
}

function ZoneRow({
  zone,
  disableDelete,
  pending,
  onUpdate,
  onDelete,
}: {
  zone: RotaSettingsZone
  disableDelete: boolean
  pending: boolean
  onUpdate: (zoneId: string, name: string) => Promise<void>
  onDelete: (zoneId: string) => Promise<void>
}) {
  return (
    <div className="flex min-h-16 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {zone.name}
        </p>
        <p className="text-xs text-muted-foreground">Used in rota planning</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <EditZoneDialog
          defaultName={zone.name}
          pending={pending}
          onSubmit={async ({ name }) => {
            await onUpdate(zone.id, name)
          }}
        />
        <DeleteZoneDialog
          zoneName={zone.name}
          pending={pending}
          disabled={disableDelete}
          onConfirm={async () => {
            await onDelete(zone.id)
          }}
        />
      </div>
    </div>
  )
}

export { RotaSettingsPage }
