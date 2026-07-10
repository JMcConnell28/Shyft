import type {
  PayrollExportData,
  PayrollExportProfile,
  PayrollExportRow,
} from "@/features/payroll/types"
import { serializeCsv } from "@/features/timesheets/utils/csv"

const DEFAULT_SAGE_BASIC_HOURS_PAY_ELEMENT = "Basic Hours"

const DEFAULT_SAGE_PAYROLL_EXPORT_PROFILE: PayrollExportProfile = {
  basicHoursPayElement: DEFAULT_SAGE_BASIC_HOURS_PAY_ELEMENT,
  columns: [
    { key: "employeeReference", label: "Employee Reference" },
    { key: "employeeName", label: "Employee Name" },
    { key: "payElement", label: "Pay Element" },
    { key: "units", label: "Units" },
    { key: "rate", label: "Rate" },
    { key: "amount", label: "Amount" },
    { key: "weekStart", label: "Week Start" },
    { key: "weekEnd", label: "Week End" },
    { key: "location", label: "Location" },
    { key: "notes", label: "Notes" },
  ],
  fileNamePrefix: "sage-payroll",
  grouping: "employee-week",
  hoursFormat: "decimal",
  id: "sage-default-csv",
  name: "Sage payroll CSV",
  provider: "sage",
}

function buildSagePayrollExportRow(input: {
  employeeName: string
  employeeReference: string
  location: string
  payableMinutes: number
  profile?: PayrollExportProfile
  weekEnd: string
  weekStart: string
}): PayrollExportRow {
  const profile = input.profile ?? DEFAULT_SAGE_PAYROLL_EXPORT_PROFILE

  return {
    amount: "",
    employeeName: input.employeeName,
    employeeReference: input.employeeReference,
    location: input.location,
    notes: "",
    payElement: profile.basicHoursPayElement,
    rate: "",
    units: formatPayrollHours(input.payableMinutes, profile),
    weekEnd: input.weekEnd,
    weekStart: input.weekStart,
  }
}

function serializeSagePayrollExportCsv(data: PayrollExportData) {
  const headers = data.profile.columns.map((column) => column.label)
  const rows = data.rows.map((row) =>
    data.profile.columns.map((column) => row[column.key] ?? "")
  )

  return serializeCsv([headers, ...rows])
}

function formatPayrollHours(minutes: number, profile: PayrollExportProfile) {
  if (profile.hoursFormat === "decimal") {
    return (minutes / 60).toFixed(2)
  }

  const absoluteMinutes = Math.abs(minutes)
  const hoursPart = Math.floor(absoluteMinutes / 60)
  const minutesPart = absoluteMinutes % 60
  const sign = minutes < 0 ? "-" : ""

  return `${sign}${hoursPart}:${minutesPart.toString().padStart(2, "0")}`
}

export {
  DEFAULT_SAGE_PAYROLL_EXPORT_PROFILE,
  buildSagePayrollExportRow,
  serializeSagePayrollExportCsv,
}
