type RotaPdfStatKey = "scheduledHours" | "labourCost" | "shiftCount"

type RotaPdfExportOptions = {
  visibleStats: Array<RotaPdfStatKey>
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
  timeLines: Array<string>
  employees: Array<RotaPdfShiftEmployee>
}

type RotaPdfDayColumn = {
  id: string
  label: string
  dateLabel: string
  shifts: Array<RotaPdfShiftCard>
}

type RotaPdfZonePage = {
  zoneId: string
  zoneName: string
  totalCostLabel: string
  totalHoursLabel: string
  totalShiftCount: number
  days: Array<RotaPdfDayColumn>
  legend: Array<RotaPdfLegendItem>
}

type RotaPdfDocumentData = {
  fileName: string
  versionLabel: string
  generatedAtLabel: string
  brandLogoUrl: string | null
  locationName: string
  note: string | null
  options: RotaPdfExportOptions
  weekLabel: string
  pages: Array<RotaPdfZonePage>
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
