import { addDays, format } from "date-fns"

import type {
  SageTimesheetExportData,
  SageTimesheetExportRow,
  TimesheetEntry,
} from "@/features/timesheets/types"
import { serializeCsv } from "@/features/timesheets/utils/csv"

const SAGE_BASIC_HOURS_PAY_ELEMENT = "Basic Hours"

const sageTimesheetExportHeaders = [
  "Employee Reference",
  "Employee Name",
  "Pay Element",
  "Units",
  "Rate",
  "Amount",
  "Week Start",
  "Week End",
  "Location",
  "Notes",
] as const

function buildSageTimesheetExportData(input: {
  entries: TimesheetEntry[]
  locationName: string
  locationSlug: string | null
  rotaId: string
  weekStart: string
}): SageTimesheetExportData {
  const weekEnd = format(addDays(new Date(input.weekStart), 6), "dd/MM/yyyy")
  const rows = buildSagePayrollRows({
    entries: input.entries,
    locationName: input.locationName,
    weekEnd,
    weekStart: formatDateOnly(input.weekStart),
  })

  return {
    fileName: buildSageTimesheetFileName({
      locationName: input.locationName,
      locationSlug: input.locationSlug,
      rotaId: input.rotaId,
      weekStart: input.weekStart,
    }),
    missingPayrollEmployees: getMissingPayrollEmployees(input.entries),
    rows,
  }
}

function serializeSageTimesheetExportCsv(data: SageTimesheetExportData) {
  const rows = data.rows.map((row) => [
    row.employeeReference,
    row.employeeName,
    row.payElement,
    row.units,
    row.rate,
    row.amount,
    row.weekStart,
    row.weekEnd,
    row.location,
    row.notes,
  ])

  return serializeCsv([Array.from(sageTimesheetExportHeaders), ...rows])
}

function getMissingPayrollEmployees(entries: TimesheetEntry[]) {
  return Array.from(
    new Set(
      entries
        .filter((entry) => entry.payableMinutes > 0)
        .filter((entry) => !entry.employeePayrollId)
        .map((entry) => entry.employeeName)
    )
  ).sort((left, right) => left.localeCompare(right))
}

function buildSagePayrollRows(input: {
  entries: TimesheetEntry[]
  locationName: string
  weekEnd: string
  weekStart: string
}) {
  return Array.from(getPayableMinutesByEmployee(input.entries).values())
    .sort((left, right) => left.employeeName.localeCompare(right.employeeName))
    .map<SageTimesheetExportRow>((employee) => ({
      amount: "",
      employeeName: employee.employeeName,
      employeeReference: employee.employeePayrollId,
      location: input.locationName,
      notes: "",
      payElement: SAGE_BASIC_HOURS_PAY_ELEMENT,
      rate: "",
      units: formatDecimalHours(employee.payableMinutes),
      weekEnd: input.weekEnd,
      weekStart: input.weekStart,
    }))
}

function getPayableMinutesByEmployee(entries: TimesheetEntry[]) {
  return entries.reduce<
    Map<
      string,
      {
        employeeName: string
        employeePayrollId: string
        payableMinutes: number
      }
    >
  >((map, entry) => {
    if (entry.payableMinutes <= 0 || !entry.employeePayrollId) {
      return map
    }

    const current = map.get(entry.employeeId)
    map.set(entry.employeeId, {
      employeeName: entry.employeeName,
      employeePayrollId: entry.employeePayrollId,
      payableMinutes: (current?.payableMinutes ?? 0) + entry.payableMinutes,
    })

    return map
  }, new Map())
}

function getUnresolvedEntryEmployees(entries: TimesheetEntry[]) {
  return Array.from(
    new Set(
      entries
        .filter(
          (entry) =>
            entry.status === "open" || entry.status === "requires_review"
        )
        .map((entry) => entry.employeeName)
    )
  ).sort((left, right) => left.localeCompare(right))
}

function buildSageTimesheetFileName(input: {
  locationName: string
  locationSlug: string | null
  rotaId: string
  weekStart: string
}) {
  const locationSlug =
    input.locationSlug?.trim() || slugifyFilePart(input.locationName)
  const rotaShortId = input.rotaId.slice(0, 8)

  return `sage-payroll-${locationSlug || "location"}-${input.weekStart}-${rotaShortId}.csv`
}

function formatDateOnly(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  return format(new Date(value), "dd/MM/yyyy")
}

function formatDecimalHours(minutes: number) {
  return (minutes / 60).toFixed(2)
}

function slugifyFilePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export {
  buildSageTimesheetExportData,
  getMissingPayrollEmployees,
  getUnresolvedEntryEmployees,
  serializeSageTimesheetExportCsv,
}
