"use client"

import * as React from "react"
import { MapPinIcon } from "lucide-react"

import type { ClockSettingsPageData } from "@/features/time-clock/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ClockLocationSettings } from "@/features/time-clock/components/clock-location-settings"
import { useClockSettingsMutations } from "@/features/time-clock/hooks/use-time-clock-mutations"
import { useClockSettingsQuery } from "@/features/time-clock/hooks/use-time-clock-query"

function ClockSettingsPage({
  initialData,
  organizationId,
  locationId,
  userId,
  workspaceSlug,
}: {
  initialData: ClockSettingsPageData
  organizationId?: string
  locationId?: string
  userId: string
  workspaceSlug: string
}) {
  const input = { organizationId, locationId, userId }
  const query = useClockSettingsQuery(input)
  const data = query.data ?? initialData
  const mutations = useClockSettingsMutations(input)
  const [selectedLocationId, setSelectedLocationId] = React.useState(
    data.locations[0]?.id ?? ""
  )
  const selectedLocation =
    data.locations.find((location) => location.id === selectedLocationId) ??
    data.locations[0]

  if (data.locations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#dfe4ef] bg-white px-5 py-10 text-center">
        <p className="text-sm font-bold text-[#14214a]">No locations found</p>
        <p className="mt-1 text-xs font-medium text-[#7180a2]">
          Add a location before configuring clock-in stations.
        </p>
      </div>
    )
  }

  return (
    <div className="min-w-0">
      {data.locations.length > 1 ? (
        <div className="mb-3 flex items-center justify-end gap-2">
          <MapPinIcon className="size-4 shrink-0 text-blue-600" />
          <span className="text-[11px] font-semibold text-[#7180a2]">
            Location
          </span>
          <Select
            onValueChange={(value) => {
              if (typeof value === "string") setSelectedLocationId(value)
            }}
            value={selectedLocation.id}
          >
            <SelectTrigger
              aria-label="Location"
              className="h-8 min-w-40 cursor-pointer rounded-lg border-[#dce3ef] bg-white px-2.5 text-xs font-semibold text-[#14214a] shadow-none"
            >
              <SelectValue>{selectedLocation.name}</SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              {data.locations.map((location) => (
                <SelectItem
                  className="cursor-pointer"
                  key={location.id}
                  value={location.id}
                >
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {query.isError ? (
        <p className="mb-4 rounded-lg border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
          Showing the last loaded settings. Refresh to try again.
        </p>
      ) : null}

      <ClockLocationSettings
        location={selectedLocation}
        mutations={mutations}
        workspaceSlug={workspaceSlug}
      />
    </div>
  )
}

export { ClockSettingsPage }
