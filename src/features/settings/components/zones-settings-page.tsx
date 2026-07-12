"use client"

import * as React from "react"
import { Layers3Icon, MapPinIcon } from "lucide-react"

import type { RotaSettingsZone } from "@/features/settings/types"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  ResourceInfo,
  ResourcePageHeader,
  ResourceSearch,
} from "@/features/settings/components/resource-settings-page"
import {
  CreateZoneDialog,
  EditZoneDialog,
} from "@/features/settings/components/zone-dialog"
import { useRotaSettingsQuery } from "@/features/settings/hooks/use-rota-settings-query"
import { useZoneSettingsMutations } from "@/features/settings/hooks/use-zone-settings-mutations"

type ZoneListItem = RotaSettingsZone & {
  locationId: string
  locationName: string
}

function ZonesSettingsPage({
  organizationId,
  locationId,
  userId,
}: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const [search, setSearch] = React.useState("")
  const [locationFilter, setLocationFilter] = React.useState("all")
  const query = useRotaSettingsQuery({ organizationId, locationId, userId })
  const mutations = useZoneSettingsMutations({
    organizationId,
    locationId,
    userId,
  })

  if (query.isPending) return <ZonesState message="Loading zones..." />
  if (query.isError)
    return <ZonesState message="We could not load zones right now." />

  const zones = query.data.locations.flatMap((location) =>
    location.zones.map((zone) => ({
      ...zone,
      locationId: location.id,
      locationName: location.name,
    }))
  )
  const filteredZones = zones.filter(
    (zone) =>
      (locationFilter === "all" || zone.locationId === locationFilter) &&
      `${zone.name} ${zone.locationName}`
        .toLowerCase()
        .includes(search.toLowerCase())
  )
  const isBusy =
    mutations.createMutation.isPending || mutations.updateMutation.isPending

  return (
    <div className="space-y-5 text-[#11245a]">
      <ResourcePageHeader
        title="Zones"
        description="Manage your locations and working areas."
        action={
          <CreateZoneDialog
            pending={isBusy}
            locations={query.data.locations}
            onSubmit={async ({ name, locationId: selectedLocationId }) => {
              const targetLocationId =
                selectedLocationId ?? query.data.locations[0]?.id
              if (!targetLocationId) throw new Error("Choose a location first.")
              await mutations.createMutation.mutateAsync({
                locationId: targetLocationId,
                name,
              })
            }}
          />
        }
      />

      <div className="flex gap-2">
        <ResourceSearch
          value={search}
          onChange={setSearch}
          placeholder="Search zones..."
        />
        {query.data.locations.length > 1 ? (
          <NativeSelect
            aria-label="Filter zones by location"
            className="h-10 w-36 rounded-lg border-[#dfe5f0] bg-white text-xs sm:w-48"
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
          >
            <NativeSelectOption value="all">All locations</NativeSelectOption>
            {query.data.locations.map((location) => (
              <NativeSelectOption key={location.id} value={location.id}>
                {location.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        ) : null}
      </div>

      <ZonesList
        zones={filteredZones}
        pending={isBusy}
        onUpdate={async (zoneId, name) => {
          await mutations.updateMutation.mutateAsync({ zoneId, name })
        }}
      />

      <ResourceInfo>
        Zones are working areas used to place shifts accurately within each
        location.
      </ResourceInfo>
    </div>
  )
}

function ZonesList({
  zones,
  pending,
  onUpdate,
}: {
  zones: Array<ZoneListItem>
  pending: boolean
  onUpdate: (zoneId: string, name: string) => Promise<void>
}) {
  if (zones.length === 0)
    return <ZonesState message="No zones match your search." />

  return (
    <section className="overflow-hidden rounded-xl border border-[#dfe5f0] bg-white shadow-[0_8px_24px_rgba(30,50,96,0.045)]">
      <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b border-[#dfe5f0] px-5 py-3 text-[11px] font-semibold tracking-wide text-[#61709a] uppercase md:grid">
        <span>Zone name</span>
        <span>Location</span>
        <span>Actions</span>
      </div>
      <div className="divide-y divide-[#e7ebf3]">
        {zones.map((zone, index) => (
          <div
            key={zone.id}
            className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center md:px-5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={
                  index % 3 === 1
                    ? "flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#ebf9ee] text-[#20a54a]"
                    : index % 3 === 2
                      ? "flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff5dd] text-[#e89b00]"
                      : "flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0968f5]"
                }
              >
                <Layers3Icon className="size-5" />
              </span>
              <strong className="truncate text-sm">{zone.name}</strong>
            </div>
            <div className="flex items-center gap-2 pl-14 text-sm font-medium text-[#61709a] md:pl-0">
              <MapPinIcon className="size-4" />
              {zone.locationName}
            </div>
            <div className="flex justify-end">
              <EditZoneDialog
                defaultName={zone.name}
                pending={pending}
                onSubmit={({ name }) => onUpdate(zone.id, name)}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-[#e7ebf3] px-5 py-3 text-xs font-semibold text-[#61709a]">
        {zones.length} zone{zones.length === 1 ? "" : "s"}
      </div>
    </section>
  )
}

function ZonesState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-[#dfe5f0] bg-white p-6 text-center text-sm font-medium text-[#61709a]">
      {message}
    </div>
  )
}

export { ZonesSettingsPage }
