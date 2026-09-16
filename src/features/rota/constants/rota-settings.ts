import type { RotaSettingsValues } from "@/features/rota/types/settings"

const DEFAULT_ROTA_SETTINGS: RotaSettingsValues = {
  allowEditAfterPublish: true,
  confirmShiftDelete: true,
  copyNotesByDefault: true,
  defaultZoneId: null,
  notifyStaffOnPublish: true,
  showNotesToStaff: true,
}

export { DEFAULT_ROTA_SETTINGS }
