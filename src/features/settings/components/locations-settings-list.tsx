import { Building2Icon } from "lucide-react"

import type { LocationSettingsItem } from "@/features/settings/types"
import { LocationSettingsDialog } from "@/features/settings/components/location-settings-dialog"

function LocationsSettingsList({
  locations,
  organizationId,
  locationId,
  userId,
}: {
  locations: Array<LocationSettingsItem>
  organizationId?: string
  locationId?: string
  userId: string
}) {
  if (locations.length === 0) {
    return (
      <div className="rounded-xl border border-[#dfe5f0] bg-white p-6 text-center text-sm font-medium text-[#61709a]">
        No locations match your search.
      </div>
    )
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[#dfe5f0] bg-white shadow-[0_8px_24px_rgba(30,50,96,0.045)]">
      <div className="hidden grid-cols-[minmax(0,1.4fr)_0.7fr_0.6fr_0.55fr_auto] gap-4 border-b border-[#dfe5f0] px-5 py-3 text-[11px] font-semibold tracking-wide text-[#61709a] uppercase md:grid">
        <span>Location</span>
        <span>Employees</span>
        <span>Zones</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      <div className="divide-y divide-[#e7ebf3]">
        {locations.map((location) => (
          <LocationRow
            key={location.id}
            location={location}
            organizationId={organizationId}
            locationId={locationId}
            userId={userId}
          />
        ))}
      </div>
    </section>
  )
}

function LocationRow({
  location,
  organizationId,
  locationId,
  userId,
}: {
  location: LocationSettingsItem
  organizationId?: string
  locationId?: string
  userId: string
}) {
  return (
    <div className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1.4fr)_0.7fr_0.6fr_0.55fr_auto] md:items-center md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0968f5]">
          <Building2Icon className="size-5" />
        </span>
        <span className="min-w-0">
          <strong className="block truncate text-sm">{location.name}</strong>
          <span className="mt-0.5 block truncate text-xs text-[#61709a]">
            /{location.slug}
          </span>
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 pl-13 text-xs text-[#61709a] md:contents">
        <span>
          <strong className="block text-sm text-[#11245a]">
            {location.employeeCount}
          </strong>
          Employees
        </span>
        <span>
          <strong className="block text-sm text-[#11245a]">
            {location.zoneCount}
          </strong>
          Zones
        </span>
        <span className="self-start rounded-full bg-[#eaf9ee] px-2 py-1 text-center font-semibold text-[#15933e]">
          Active
        </span>
      </div>
      <div className="flex justify-end">
        <LocationSettingsDialog
          location={location}
          organizationId={organizationId}
          locationId={locationId}
          userId={userId}
        />
      </div>
    </div>
  )
}

export { LocationsSettingsList }
