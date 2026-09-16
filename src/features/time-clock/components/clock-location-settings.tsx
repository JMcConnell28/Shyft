"use client"

import type { ClockSettingsLocation } from "@/features/time-clock/types"
import type { useClockSettingsMutations } from "@/features/time-clock/hooks/use-time-clock-mutations"
import { ClockingRulesSettingsSection } from "@/features/time-clock/components/clocking-rules-settings-section"
import { ClockStationHealthSection } from "@/features/time-clock/components/clock-station-health-section"
import { ClockStationSettingsSection } from "@/features/time-clock/components/clock-station-settings-section"
import { MissedClockOutSettingsSection } from "@/features/time-clock/components/missed-clock-out-settings-section"
import { useClockLocationSettings } from "@/features/time-clock/hooks/use-clock-location-settings"

type ClockSettingsMutations = ReturnType<typeof useClockSettingsMutations>

function ClockLocationSettings({
  location,
  mutations,
  workspaceSlug,
}: {
  location: ClockSettingsLocation
  mutations: ClockSettingsMutations
  workspaceSlug: string
}) {
  const { isSaving, update, values } = useClockLocationSettings(
    location,
    mutations
  )
  const isActivating =
    mutations.activateStationMutation.isPending &&
    mutations.activateStationMutation.variables.locationId === location.id

  return (
    <div className="animate-in space-y-2.5 duration-300 fade-in slide-in-from-bottom-1 motion-reduce:animate-none sm:space-y-3">
      <div className="flex h-4 items-center justify-end text-[10px] font-semibold text-[#7180a2]">
        {isSaving ? (
          <span className="text-[#1769ff]">Saving changes...</span>
        ) : (
          <span>Changes save automatically</span>
        )}
      </div>
      <ClockStationSettingsSection
        isActivating={isActivating}
        location={location}
        onActivate={(locationId) =>
          mutations.activateStationMutation.mutate({ locationId })
        }
        onUpdate={update}
        values={values}
      />
      <ClockingRulesSettingsSection onUpdate={update} values={values} />
      <MissedClockOutSettingsSection onUpdate={update} values={values} />
      <ClockStationHealthSection
        location={location}
        workspaceSlug={workspaceSlug}
      />
    </div>
  )
}

export { ClockLocationSettings }
