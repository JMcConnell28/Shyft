import { addDays, format } from "date-fns"

import {
  DEFAULT_SAGE_PAYROLL_EXPORT_PROFILE,
  buildSagePayrollExportRow,
  serializeSagePayrollExportCsv,
} from "@/features/payroll/adapters/sage-csv"
import type { PayrollExportProfile } from "@/features/payroll/types"
import type {
  SageTimesheetExportData,
  TimesheetEntry,
} from "@/features/timesheets/types"

function buildSageTimesheetExportData(input: {
  entries: TimesheetEntry[]
  locationName: string
  locationSlug: string | null
  profile?: PayrollExportProfile
  rotaId: string
  weekStart: string
}): SageTimesheetExportData {
  const profile = input.profile ?? DEFAULT_SAGE_PAYROLL_EXPORT_PROFILE
  const weekEnd = format(addDays(new Date(input.weekStart), 6), "dd/MM/yyyy")
  const rows = buildSagePayrollRows({
    entries: input.entries,
    locationName: input.locationName,
    profile,
    weekEnd,
    weekStart: formatDateOnly(input.weekStart),
  })

  return {
    fileName: buildSageTimesheetFileName({
      locationName: input.locationName,
      locationSlug: input.locationSlug,
      profile,
      rotaId: input.rotaId,
      weekStart: input.weekStart,
    }),
    missingPayrollEmployees: getMissingPayrollEmployees(input.entries),
    profile,
    rows,
  }
}

function serializeSageTimesheetExportCsv(data: SageTimesheetExportData) {
  return serializeSagePayrollExportCsv(data)
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
  profile: PayrollExportProfile
  weekEnd: string
  weekStart: string
}) {
  return Array.from(getPayableMinutesByEmployee(input.entries).values())
    .sort((left, right) => left.employeeName.localeCompare(right.employeeName))
    .map((employee) =>
      buildSagePayrollExportRow({
        employeeName: employee.employeeName,
        employeeReference: employee.employeePayrollId,
        location: input.locationName,
        payableMinutes: employee.payableMinutes,
        profile: input.profile,
        weekEnd: input.weekEnd,
        weekStart: input.weekStart,
      })
    )
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
  profile: { fileNamePrefix: string }
  rotaId: string
  weekStart: string
}) {
  const locationSlug =
    input.locationSlug?.trim() || slugifyFilePart(input.locationName)
  const rotaShortId = input.rotaId.slice(0, 8)

  return `${input.profile.fileNamePrefix}-${locationSlug || "location"}-${input.weekStart}-${rotaShortId}.csv`
}

function formatDateOnly(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  return format(new Date(value), "dd/MM/yyyy")
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
