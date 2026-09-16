"use client"

import * as React from "react"

import type {
  ClockSettingsLocation,
  ClockSettingsValues,
} from "@/features/time-clock/types"
import type { useClockSettingsMutations } from "@/features/time-clock/hooks/use-time-clock-mutations"
import {
  getClockSettingsValues,
  normalizeClockSettingsValues,
} from "@/features/time-clock/utils/clock-settings"

type ClockSettingsMutations = ReturnType<typeof useClockSettingsMutations>

function useClockLocationSettings(
  location: ClockSettingsLocation,
  mutations: ClockSettingsMutations
) {
  const [values, setValues] = React.useState(() =>
    getClockSettingsValues(location)
  )

  React.useEffect(() => {
    setValues(getClockSettingsValues(location))
  }, [location])

  const update = React.useCallback(
    (patch: Partial<ClockSettingsValues>) => {
      const next = normalizeClockSettingsValues(values, patch)

      setValues(next)
      mutations.updateSettingsMutation.mutate({
        ...next,
        locationId: location.id,
      })
    },
    [location.id, mutations.updateSettingsMutation, values]
  )

  return {
    isSaving:
      mutations.updateSettingsMutation.isPending &&
      mutations.updateSettingsMutation.variables.locationId === location.id,
    update,
    values,
  }
}

export { useClockLocationSettings }
