"use client"

import * as React from "react"

import type {
  RotaSettingsLocation,
  RotaSettingsValues,
} from "@/features/settings/types"
import type { useRotaSettingsMutations } from "@/features/settings/hooks/use-rota-settings-mutations"
import {
  getRotaSettingsValues,
  normalizeRotaSettingsValues,
} from "@/features/settings/utils/rota-settings"

type RotaSettingsMutations = ReturnType<typeof useRotaSettingsMutations>

function useRotaLocationSettings(
  location: RotaSettingsLocation,
  mutations: RotaSettingsMutations
) {
  const [values, setValues] = React.useState(() =>
    getRotaSettingsValues(location)
  )

  React.useEffect(() => {
    setValues(getRotaSettingsValues(location))
  }, [location])

  const update = React.useCallback(
    (patch: Partial<RotaSettingsValues>) => {
      const next = normalizeRotaSettingsValues(values, patch)

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

export { useRotaLocationSettings }
