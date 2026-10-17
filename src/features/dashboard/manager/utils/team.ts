import type { AttendanceRow, ScheduleRow } from "../server/record-schemas"
import type { DashboardLocation, TeamRow, TeamStatus } from "../types"

function getTeamStatus(input: {
  entry: AttendanceRow | undefined
  startsAt: string | null
  reviewed: boolean
  attendanceEnabled: boolean
  isToday: boolean
  now: Date
  grace: number
}): TeamStatus {
  if (!input.attendanceEnabled) return "scheduled"
  if (input.entry) {
    if (input.entry.clocked_out_at) return "finished"
    return input.isToday ? "working" : "clock_out_missing"
  }
  if (input.reviewed) return "reviewed"
  if (
    input.startsAt &&
    input.now.getTime() >
      new Date(input.startsAt).getTime() + input.grace * 60000
  )
    return "arrival_due"
  return "upcoming"
}

function buildDashboardTeam(input: {
  schedule: Array<ScheduleRow>
  attendance: Array<AttendanceRow>
  location: DashboardLocation
  now: Date
  isToday: boolean
}): Array<TeamRow> {
  const used = new Set<string>()
  const entriesByEmployee = new Map<string, Array<AttendanceRow>>()
  for (const entry of input.attendance) {
    const entries = entriesByEmployee.get(entry.employee_id) ?? []
    entries.push(entry)
    entriesByEmployee.set(entry.employee_id, entries)
  }
  const rows: Array<TeamRow> = input.schedule.flatMap((shift) => {
    const entries = (entriesByEmployee.get(shift.employee_id) ?? []).filter(
      (entry) =>
        entry.employee_id === shift.employee_id &&
        ((entry.rota_published_shift_id === shift.shift_id &&
          entry.shift_segment === shift.segment) ||
          (!entry.rota_published_shift_id &&
            entry.clocked_in_at < shift.ends_at &&
            (entry.clocked_out_at ?? input.now.toISOString()) >
              shift.starts_at))
    )
    // Multiple clock records are retained as individual rows; no clock history is discarded.
    for (const entry of entries) used.add(entry.id)
    return entries.length
      ? entries.map((entry) => makeRow(shift, entry, input))
      : [makeRow(shift, undefined, input)]
  })
  for (const entry of input.attendance) {
    if (!used.has(entry.id)) rows.push(makeRow(undefined, entry, input))
  }
  return rows.sort(
    (a, b) =>
      (a.startsAt ?? a.clockedInAt ?? "").localeCompare(
        b.startsAt ?? b.clockedInAt ?? ""
      ) || a.employeeName.localeCompare(b.employeeName)
  )
}

function makeRow(
  shift: ScheduleRow | undefined,
  entry: AttendanceRow | undefined,
  input: {
    location: DashboardLocation
    now: Date
    isToday: boolean
  }
): TeamRow {
  const lateMinutes =
    shift && entry
      ? Math.max(
          0,
          (new Date(entry.clocked_in_at).getTime() -
            new Date(shift.starts_at).getTime()) /
            60000
        )
      : 0
  return {
    key: `${shift?.assignment_id ?? "unscheduled"}:${shift?.segment ?? entry?.shift_segment}:${entry?.id ?? "scheduled"}`,
    employeeId: shift?.employee_id ?? entry?.employee_id ?? "",
    employeeName:
      shift?.employee_name ?? entry?.employee_name ?? "Unknown employee",
    isActive: (shift?.employee_status ?? entry?.employee_status) === "active",
    workDate: shift?.day_date ?? null,
    zone: shift?.zone ?? entry?.zone ?? "Unscheduled",
    rotaId: shift?.rota_id ?? entry?.rota_id ?? null,
    assignmentId: shift?.assignment_id ?? null,
    shiftId: shift?.shift_id ?? entry?.rota_published_shift_id ?? null,
    segment: shift?.segment ?? entry?.shift_segment ?? "full",
    startsAt: shift?.starts_at ?? null,
    endsAt: shift?.ends_at ?? null,
    closesAtEstimate: shift?.is_closing ?? false,
    clockedInAt: entry?.clocked_in_at ?? null,
    clockedOutAt: entry?.clocked_out_at ?? null,
    entryId: entry?.id ?? null,
    notes: entry?.notes ?? shift?.resolution_reason ?? null,
    requiresReview: entry?.status === "requires_review",
    lateMinutes:
      lateMinutes > input.location.lateGraceMinutes
        ? Math.ceil(lateMinutes)
        : 0,
    status: getTeamStatus({
      entry,
      startsAt: shift?.starts_at ?? null,
      reviewed: Boolean(shift?.resolution_reason),
      attendanceEnabled: input.location.attendanceEnabled,
      isToday: input.isToday,
      now: input.now,
      grace: input.location.lateGraceMinutes,
    }),
  }
}

function getTeamSummary(team: Array<TeamRow>): {
  scheduled: number
  working: number
  recorded: number
} {
  const count = (predicate: (row: TeamRow) => boolean) =>
    new Set(team.filter(predicate).map((row) => row.employeeId)).size
  return {
    scheduled: count((row) => Boolean(row.assignmentId)),
    working: count((row) => row.status === "working"),
    recorded: count((row) => Boolean(row.entryId)),
  }
}
export { buildDashboardTeam, getTeamStatus, getTeamSummary }
