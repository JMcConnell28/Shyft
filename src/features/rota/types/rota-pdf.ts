type RotaPdfStatKey = "scheduledHours" | "labourCost" | "shiftCount"

type RotaPdfExportOptions = {
  visibleStats: RotaPdfStatKey[]
}

type RotaPdfLegendItem = {
  badgeText: string
  id: string
  name: string
  colorHex: string
}

type RotaPdfShiftEmployee = {
  badgeText: string
  id: string
  name: string
  groupId: string
  groupName: string
  groupColorHex: string
}

type RotaPdfShiftCard = {
  id: string
  timeLines: string[]
  employees: RotaPdfShiftEmployee[]
}

type RotaPdfDayColumn = {
  id: string
  label: string
  dateLabel: string
  shifts: RotaPdfShiftCard[]
}

type RotaPdfZonePage = {
  zoneId: string
  zoneName: string
  totalCostLabel: string
  totalHoursLabel: string
  totalShiftCount: number
  days: RotaPdfDayColumn[]
  legend: RotaPdfLegendItem[]
}

type RotaPdfDocumentData = {
  fileName: string
  generatedAtLabel: string
  brandLogoUrl: string | null
  locationName: string
  note: string | null
  options: RotaPdfExportOptions
  weekLabel: string
  pages: RotaPdfZonePage[]
}

export type {
  RotaPdfDayColumn,
  RotaPdfDocumentData,
  RotaPdfExportOptions,
  RotaPdfLegendItem,
  RotaPdfStatKey,
  RotaPdfShiftCard,
  RotaPdfShiftEmployee,
  RotaPdfZonePage,
}
