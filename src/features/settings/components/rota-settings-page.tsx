"use client"

import * as React from "react"
import { LoaderCircleIcon, MapPinIcon, TriangleAlertIcon } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RotaLocationSettings } from "@/features/settings/components/rota-location-settings"
import { useRotaSettingsMutations } from "@/features/settings/hooks/use-rota-settings-mutations"
import { useRotaSettingsQuery } from "@/features/settings/hooks/use-rota-settings-query"
import { useRotaTemplateSettingsMutations } from "@/features/settings/hooks/use-rota-template-settings-mutations"
import { getErrorMessage } from "@/lib/errors"

function RotaSettingsPage({
  organizationId,
  userId,
}: {
  organizationId: string
  userId: string
}) {
  const input = { organizationId, userId }
  const query = useRotaSettingsQuery(input)
  const rotaMutations = useRotaSettingsMutations(input)
  const templateMutations = useRotaTemplateSettingsMutations(input)
  const [selectedLocationId, setSelectedLocationId] = React.useState("")

  if (query.isPending) {
    return (
      <RotaSettingsState
        icon={LoaderCircleIcon}
        message="Loading rota settings..."
      />
    )
  }

  if (query.isError) {
    return (
      <RotaSettingsState
        icon={TriangleAlertIcon}
        message={getErrorMessage(
          query.error,
          "We could not load your rota settings right now."
        )}
      />
    )
  }

  const selectedLocation =
    query.data.locations.find(
      (location) => location.id === selectedLocationId
    ) ?? query.data.locations.at(0)

  const templates = selectedLocation
    ? query.data.templates.filter(
        (template) => template.locationId === selectedLocation.id
      )
    : []

  return (
    <div className="min-w-0 space-y-3 text-[#10204b]">
      {selectedLocation && query.data.locations.length > 1 ? (
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
              {query.data.locations.map((location) => (
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

      {selectedLocation ? (
        <RotaLocationSettings
          key={selectedLocation.id}
          location={selectedLocation}
          rotaMutations={rotaMutations}
          templateMutations={templateMutations}
          templates={templates}
          input={input}
        />
      ) : (
        <RotaSettingsState
          icon={MapPinIcon}
          message="Add a location first, then you can manage its rota setup here."
        />
      )}
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
    <section className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-[#dce3ef] bg-white p-6 text-center text-sm font-semibold text-[#61709a]">
      <Icon className="mb-3 size-5 text-[#0069ff]" />
      {message}
    </section>
  )
}

export { RotaSettingsPage }
