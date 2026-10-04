import type { RotaSettingsValues } from "@/features/rota/types/settings"

import { DEFAULT_ROTA_TIME_FORMAT } from "@/features/rota/constants/time-format"

const DEFAULT_ROTA_SETTINGS: RotaSettingsValues = {
  allowEditAfterPublish: true,
  confirmShiftDelete: true,
  copyNotesByDefault: true,
  defaultZoneId: null,
  notifyStaffOnPublish: true,
  showNotesToStaff: true,
  timeFormat: DEFAULT_ROTA_TIME_FORMAT,
}

export { DEFAULT_ROTA_SETTINGS }
