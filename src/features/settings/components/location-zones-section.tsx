"use client"

import { Layers3Icon } from "lucide-react"

import type { LocationSettingsItem } from "@/features/settings/types"
import {
  CreateZoneDialog,
  EditZoneDialog,
} from "@/features/settings/components/zone-dialog"
import { DeleteZoneDialog } from "@/features/settings/components/delete-zone-dialog"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { useZoneSettingsMutations } from "@/features/settings/hooks/use-zone-settings-mutations"

function LocationZonesSection({
  location,
  organizationId,
  userId,
}: {
  location: LocationSettingsItem
  organizationId: string
  userId: string
}) {
  const mutations = useZoneSettingsMutations({ organizationId, userId })
  const pending =
    mutations.createMutation.isPending ||
    mutations.updateMutation.isPending ||
    mutations.deleteMutation.isPending

  return (
    <SettingsSection
      icon={Layers3Icon}
      title="Zones"
      description="Working areas used when planning shifts. Archived zones remain visible on old rotas."
    >
      {location.zones.map((zone) => (
        <div
          key={zone.id}
          className="flex flex-wrap items-center justify-between gap-2 py-2.5"
        >
          <span className="min-w-0 text-xs font-bold text-[#14214a]">
            {zone.name}
          </span>
          <div className="flex items-center gap-2">
            <EditZoneDialog
              defaultName={zone.name}
              pending={pending}
              onSubmit={async ({ name }) => {
                await mutations.updateMutation.mutateAsync({
                  zoneId: zone.id,
                  name,
                })
              }}
            />
            <DeleteZoneDialog
              disabled={pending || location.zones.length <= 1}
              pending={mutations.deleteMutation.isPending}
              zoneName={zone.name}
              onConfirm={async () => {
                await mutations.deleteMutation.mutateAsync(zone.id)
              }}
            />
          </div>
        </div>
      ))}
      <div className="py-3">
        <CreateZoneDialog
          pending={pending}
          onSubmit={async ({ name }) => {
            await mutations.createMutation.mutateAsync({
              locationId: location.id,
              name,
            })
          }}
        />
        {location.zones.length <= 1 ? (
          <p className="mt-2 text-[11px] text-[#7180a2]">
            Each location must keep at least one active zone.
          </p>
        ) : null}
      </div>
    </SettingsSection>
  )
}

export { LocationZonesSection }
