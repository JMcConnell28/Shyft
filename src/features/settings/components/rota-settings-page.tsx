"use client"

import {
  InfoIcon,
  Layers3Icon,
  LayoutTemplateIcon,
  LoaderCircleIcon,
  MapPinnedIcon,
  TriangleAlertIcon,
} from "lucide-react"

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
      <RotaSettingsState
        icon={LoaderCircleIcon}
        message="Loading rota settings..."
      />
    )
  }

  if (settingsQuery.isError) {
    return (
      <RotaSettingsState
        icon={TriangleAlertIcon}
        message={getErrorMessage(
          settingsQuery.error,
          "We could not load your rota settings right now."
        )}
      />
    )
  }

  if (settingsQuery.data.locations.length === 0) {
    return (
      <RotaSettingsState
        icon={MapPinnedIcon}
        message="Add a location first, then you can manage its rota setup here."
      />
    )
  }

  const isBusy =
    mutations.createMutation.isPending ||
    mutations.updateMutation.isPending ||
    mutations.deleteMutation.isPending
  const isTemplateBusy =
    templateMutations.renameMutation.isPending ||
    templateMutations.deleteMutation.isPending
  const zoneCount = settingsQuery.data.locations.reduce(
    (total, location) => total + location.zones.length,
    0
  )

  return (
    <div className="space-y-4 text-[#11245a]">
      <RotaSettingsOverview
        locationCount={settingsQuery.data.locations.length}
        templateCount={settingsQuery.data.templates.length}
        zoneCount={zoneCount}
      />

      <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.035em]">Zones</h2>
          <p className="mt-1 text-sm font-semibold text-[#61709a]">
            Organise shifts by the areas your managers schedule.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {settingsQuery.data.locations.map((location) => (
            <RotaLocationZoneGroup
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
        </div>
      </section>

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

      <p className="flex items-start gap-2 rounded-xl border border-[#cddcff] bg-[#f5f8ff] px-4 py-3 text-sm font-semibold text-[#33477d]">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-[#0069ff]" />
        These settings apply to rota planning for the selected workspace.
      </p>
    </div>
  )
}

function RotaSettingsOverview({
  locationCount,
  templateCount,
  zoneCount,
}: {
  locationCount: number
  templateCount: number
  zoneCount: number
}) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <h2 className="text-lg font-extrabold tracking-[-0.035em]">General</h2>
      <div className="mt-4 divide-y divide-[#edf0f6]">
        <OverviewRow
          icon={MapPinnedIcon}
          label="Locations covered"
          description="Locations included in this rota setup."
          value={`${locationCount} location${locationCount === 1 ? "" : "s"}`}
        />
        <OverviewRow
          icon={Layers3Icon}
          label="Rota zones"
          description="Areas available when building shifts."
          value={`${zoneCount} zone${zoneCount === 1 ? "" : "s"}`}
        />
        <OverviewRow
          icon={LayoutTemplateIcon}
          label="Saved templates"
          description="Reusable shift patterns saved from the builder."
          value={`${templateCount} template${templateCount === 1 ? "" : "s"}`}
        />
      </div>
    </section>
  )
}

function OverviewRow({
  description,
  icon: Icon,
  label,
  value,
}: {
  description: string
  icon: typeof Layers3Icon
  label: string
  value: string
}) {
  return (
    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0">
      <span className="flex size-10 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0069ff]">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-extrabold">{label}</span>
        <span className="mt-0.5 block text-sm font-semibold text-[#61709a]">
          {description}
        </span>
      </span>
      <span className="rounded-xl bg-[#f2f5fb] px-3 py-2 text-xs font-extrabold text-[#405078]">
        {value}
      </span>
    </div>
  )
}

function RotaLocationZoneGroup({
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
    <div className="rounded-xl border border-[#dfe5f0] bg-[#fbfcff] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold">{location.name}</p>
          <p className="mt-0.5 text-xs font-semibold text-[#61709a]">
            {location.zones.length} zone
            {location.zones.length === 1 ? "" : "s"} configured
          </p>
        </div>
        <CreateZoneDialog
          pending={isBusy}
          onSubmit={async ({ name }) => {
            await onCreate(name)
          }}
        />
      </div>

      <div className="mt-3 divide-y divide-[#edf0f6]">
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
      </div>
    </div>
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
    <div className="flex min-h-14 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold text-[#11245a]">
          {zone.name}
        </p>
        <p className="text-xs font-semibold text-[#61709a]">
          Used in rota planning
        </p>
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

function RotaSettingsState({
  icon: Icon,
  message,
}: {
  icon: typeof LoaderCircleIcon
  message: string
}) {
  return (
    <section className="flex min-h-40 flex-col items-center justify-center rounded-xl bg-white p-6 text-center text-sm font-semibold text-[#61709a] shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <Icon className="mb-3 size-5 text-[#0069ff]" />
      {message}
    </section>
  )
}

export { RotaSettingsPage }
