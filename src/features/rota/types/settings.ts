import type { RotaTimeFormat } from "@/features/rota/schemas/time-format-schema"

type RotaSettingsValues = {
  allowEditAfterPublish: boolean
  confirmShiftDelete: boolean
  copyNotesByDefault: boolean
  defaultZoneId: string | null
  notifyStaffOnPublish: boolean
  showNotesToStaff: boolean
  timeFormat: RotaTimeFormat
}

export type { RotaSettingsValues }
