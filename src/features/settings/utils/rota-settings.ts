import type {
  RotaSettingsLocation,
  RotaSettingsValues,
} from "@/features/settings/types"
import { DEFAULT_ROTA_SETTINGS } from "@/features/rota/constants/rota-settings"

function getRotaSettingsValues(
  location: RotaSettingsLocation
): RotaSettingsValues {
  return { ...location.settings }
}

function normalizeRotaSettingsValues(
  current: RotaSettingsValues,
  patch: Partial<RotaSettingsValues>
): RotaSettingsValues {
  return {
    ...current,
    ...patch,
  }
}

export {
  DEFAULT_ROTA_SETTINGS,
  getRotaSettingsValues,
  normalizeRotaSettingsValues,
}
