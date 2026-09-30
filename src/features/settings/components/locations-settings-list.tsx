import { Link } from "@tanstack/react-router"
import { ChevronRightIcon } from "lucide-react"

import type { LocationSettingsItem } from "@/features/settings/types"

function LocationsSettingsList({
  locations,
  workspaceSlug,
}: {
  locations: Array<LocationSettingsItem>
  workspaceSlug: string
}) {
  if (locations.length === 0) {
    return (
      <p className="py-5 text-xs font-medium text-[#7180a2]">
        No locations found.
      </p>
    )
  }

  return locations.map((location) => (
    <Link
      key={location.id}
      to="/app/$workspaceSlug/settings/locations/$locationSlug"
      params={{ workspaceSlug, locationSlug: location.slug }}
      className="flex min-h-17 items-center justify-between gap-3 py-3 focus-visible:outline-2 focus-visible:outline-blue-600"
    >
      <span className="min-w-0">
        <strong className="block truncate text-sm text-[#14214a]">
          {location.name}
        </strong>
        <span className="mt-0.5 block text-[11px] font-medium text-[#7180a2]">
          {location.employeeCount} employees · {location.zoneCount} zones
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600">
        Edit <ChevronRightIcon className="size-4" />
      </span>
    </Link>
  ))
}

export { LocationsSettingsList }
