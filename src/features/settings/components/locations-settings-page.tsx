"use client"

import * as React from "react"
import {
  Building2Icon,
  CalendarCheckIcon,
  Layers3Icon,
  UsersIcon,
} from "lucide-react"

import type { LocationSettingsItem } from "@/features/settings/types"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { CreateLocationDialog } from "@/features/settings/components/create-location-dialog"
import { LocationsSettingsList } from "@/features/settings/components/locations-settings-list"
import {
  ResourceInfo,
  ResourceMetric,
  ResourcePageHeader,
  ResourceSearch,
} from "@/features/settings/components/resource-settings-page"
import { useLocationSettingsMutations } from "@/features/settings/hooks/use-location-settings-mutations"
import { useLocationSettingsQuery } from "@/features/settings/hooks/use-location-settings-query"

type LocationSort = "name" | "employees" | "zones"

function LocationsSettingsPage({
  organizationId,
  locationId,
  userId,
}: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const [search, setSearch] = React.useState("")
  const [sort, setSort] = React.useState<LocationSort>("name")
  const query = useLocationSettingsQuery({ organizationId, locationId, userId })
  const mutations = useLocationSettingsMutations({
    organizationId,
    locationId,
    userId,
  })

  if (query.isPending) return <LocationsState message="Loading locations..." />
  if (query.isError)
    return <LocationsState message="We could not load locations right now." />

  const locations = sortLocations(
    query.data.locations.filter((location) =>
      `${location.name} ${location.slug}`
        .toLowerCase()
        .includes(search.toLowerCase())
    ),
    sort
  )
  const totalZones = query.data.locations.reduce(
    (total, location) => total + location.zoneCount,
    0
  )

  return (
    <div className="space-y-5 text-[#11245a]">
      <ResourcePageHeader
        title="Locations"
        description="Manage all locations in your organisation."
        action={
          organizationId ? (
            <CreateLocationDialog
              pending={mutations.createMutation.isPending}
              onSubmit={async (values) => {
                await mutations.createMutation.mutateAsync(values)
              }}
            />
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <ResourceMetric
          icon={Building2Icon}
          label="Total locations"
          value={query.data.locations.length}
        />
        <ResourceMetric
          icon={UsersIcon}
          label="Total employees"
          tone="green"
          value={query.data.totalEmployeeCount}
        />
        <ResourceMetric
          icon={CalendarCheckIcon}
          label="Active locations"
          value={query.data.locations.length}
        />
        <ResourceMetric
          icon={Layers3Icon}
          label="Zones"
          tone="purple"
          value={totalZones}
        />
      </div>

      <div className="flex gap-2">
        <ResourceSearch
          value={search}
          onChange={setSearch}
          placeholder="Search locations..."
        />
        <NativeSelect
          aria-label="Sort locations"
          className="h-10 w-32 rounded-lg border-[#dfe5f0] bg-white text-xs sm:w-40"
          value={sort}
          onChange={(event) => setSort(event.target.value as LocationSort)}
        >
          <NativeSelectOption value="name">Name</NativeSelectOption>
          <NativeSelectOption value="employees">Employees</NativeSelectOption>
          <NativeSelectOption value="zones">Zones</NativeSelectOption>
        </NativeSelect>
      </div>

      <LocationsSettingsList
        locations={locations}
        organizationId={organizationId}
        locationId={locationId}
        userId={userId}
      />

      <ResourceInfo>
        Location names are used throughout rotas and reports. Contact support if
        a legal location name needs to be changed.
      </ResourceInfo>
    </div>
  )
}

function sortLocations(
  locations: Array<LocationSettingsItem>,
  sort: LocationSort
) {
  return [...locations].sort((left, right) =>
    sort === "name"
      ? left.name.localeCompare(right.name)
      : sort === "employees"
        ? right.employeeCount - left.employeeCount
        : right.zoneCount - left.zoneCount
  )
}

function LocationsState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-[#dfe5f0] bg-white p-6 text-center text-sm font-medium text-[#61709a]">
      {message}
    </div>
  )
}

export { LocationsSettingsPage }
