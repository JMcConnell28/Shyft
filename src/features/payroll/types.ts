type PayrollProvider = "sage"

type PayrollExportGrouping = "employee-week"

type PayrollHoursFormat = "decimal" | "hours-minutes"

type PayrollExportColumnKey =
  | "amount"
  | "costCentre"
  | "date"
  | "department"
  | "employeeName"
  | "employeeReference"
  | "location"
  | "notes"
  | "payElement"
  | "rate"
  | "units"
  | "weekEnd"
  | "weekStart"

type PayrollExportColumn = {
  key: PayrollExportColumnKey
  label: string
}

type PayrollExportProfile = {
  id: string
  name: string
  provider: PayrollProvider
  fileNamePrefix: string
  basicHoursPayElement: string
  grouping: PayrollExportGrouping
  hoursFormat: PayrollHoursFormat
  columns: readonly PayrollExportColumn[]
}

type PayrollExportRow = Partial<Record<PayrollExportColumnKey, string>> & {
  employeeName: string
  employeeReference: string
  payElement: string
  units: string
}

type PayrollExportData = {
  fileName: string
  missingPayrollEmployees: string[]
  profile: PayrollExportProfile
  rows: PayrollExportRow[]
}

export type {
  PayrollExportColumn,
  PayrollExportColumnKey,
  PayrollExportData,
  PayrollExportGrouping,
  PayrollExportProfile,
  PayrollExportRow,
  PayrollHoursFormat,
  PayrollProvider,
}
