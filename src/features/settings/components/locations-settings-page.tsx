"use client"

import * as React from "react"
import { MapPinnedIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { CreateLocationDialog } from "@/features/settings/components/create-location-dialog"
import { LocationsSettingsList } from "@/features/settings/components/locations-settings-list"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { useLocationSettingsMutations } from "@/features/settings/hooks/use-location-settings-mutations"
import { useLocationSettingsQuery } from "@/features/settings/hooks/use-location-settings-query"

function LocationsSettingsPage({
  organizationId,
  userId,
  workspaceSlug,
}: {
  organizationId: string
  userId: string
  workspaceSlug: string
}) {
  const [search, setSearch] = React.useState("")
  const query = useLocationSettingsQuery({ organizationId, userId })
  const { createMutation } = useLocationSettingsMutations({
    organizationId,
    userId,
  })

  if (query.isPending)
    return (
      <p className="py-6 text-sm text-muted-foreground">Loading locations...</p>
    )
  if (query.isError)
    return (
      <p role="alert" className="py-6 text-sm text-destructive">
        We could not load locations.
      </p>
    )

  const locations = query.data.locations
    .filter((location) =>
      location.name.toLowerCase().includes(search.trim().toLowerCase())
    )
    .sort((left, right) => left.name.localeCompare(right.name))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          aria-label="Search locations"
          className="h-9 max-w-xs bg-white"
          placeholder="Search locations"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <CreateLocationDialog
          pending={createMutation.isPending}
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values)
          }}
        />
      </div>
      <SettingsSection
        icon={MapPinnedIcon}
        title="Locations"
        description="Manage each workplace, its zones, address and closing times."
      >
        <LocationsSettingsList
          locations={locations}
          workspaceSlug={workspaceSlug}
        />
      </SettingsSection>
    </div>
  )
}

export { LocationsSettingsPage }
