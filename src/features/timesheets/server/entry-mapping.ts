import { format } from "date-fns"

import type { ClockShiftSegment } from "@/features/time-clock/types"
import type { TimesheetEntry } from "@/features/timesheets/types"
import type {
  ScheduledShiftRow,
  TimeEntryRow,
} from "@/features/timesheets/server/row-types"
import {
  getShiftSegmentTimeLabel,
  type PublishedShiftCandidate,
  toShiftMatch,
} from "@/features/time-clock/utils/shift-matching"
import { getMinutesBetween } from "@/features/timesheets/utils/timesheet-time"

function mapEntryRows(input: {
  entries: Array<TimeEntryRow>
  now: Date
  scheduledShifts: Array<ScheduledShiftRow>
}) {
  const entries = input.entries.map((entry) => mapEntryRow(entry, input.now))
  const scheduledEntries = getScheduledEntriesWithoutClockEntry({
    entries,
    scheduledShifts: input.scheduledShifts,
  })

  return [...entries, ...scheduledEntries].sort(compareEntries)
}

function mapEntryRow(row: TimeEntryRow, now: Date): TimesheetEntry {
  const scheduledWindow = getPersistedScheduledWindow(row)
  const scheduledStartAt =
    scheduledWindow?.startsAt.toISOString() ?? row.scheduled_start_at
  const scheduledEndAt =
    scheduledWindow?.endsAt.toISOString() ?? row.scheduled_end_at

  return {
    id: row.id,
    actualMinutes: getMinutesBetween(
      row.clocked_in_at,
      row.clocked_out_at,
      now
    ),
    clockedInAt: row.clocked_in_at,
    clockedOutAt: row.clocked_out_at,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    employeePayrollId: row.employee_payroll_id,
    locationId: row.location_id,
    locationName: row.location_name,
    notes: row.notes,
    payableEndAt: row.payable_end_at,
    payableMinutes: getMinutesBetween(
      row.payable_start_at ?? row.clocked_in_at,
      row.payable_end_at ?? row.clocked_out_at,
      now
    ),
    payableStartAt: row.payable_start_at ?? row.clocked_in_at,
    publishedShiftId: row.rota_published_shift_id,
    rotaId: row.rota_id,
    rotaLabel: getRotaLabel(row.rota_week_start, row.location_name),
    scheduledEndAt,
    scheduledMinutes: getMinutesBetween(scheduledStartAt, scheduledEndAt, now),
    scheduledStartAt,
    scheduledTimeLabel: getPersistedScheduleLabel(row),
    shiftSegment: row.shift_segment,
    timeZone: row.time_zone,
    source: row.source,
    status: row.status,
    zoneName: row.zone_name,
  }
}

function getScheduledEntriesWithoutClockEntry(input: {
  entries: Array<TimesheetEntry>
  scheduledShifts: Array<ScheduledShiftRow>
}) {
  const entryKeys = new Set(input.entries.map(getEntryShiftKey).filter(Boolean))
  const scheduledEntries: Array<TimesheetEntry> = []

  for (const shift of input.scheduledShifts) {
    const match = toShiftMatch(shift)

    for (const segment of match.segments) {
      const key = getShiftKey({
        employeeId: shift.employee_id,
        shiftId: shift.id,
        segment: segment.key,
      })

      if (!entryKeys.has(key)) {
        scheduledEntries.push(mapScheduledEntry(shift, segment))
      }
    }
  }

  return scheduledEntries
}

function mapScheduledEntry(
  shift: ScheduledShiftRow,
  segment: ReturnType<typeof toShiftMatch>["segments"][number]
): TimesheetEntry {
  return {
    id: null,
    actualMinutes: 0,
    clockedInAt: null,
    clockedOutAt: null,
    employeeId: shift.employee_id,
    employeeName: shift.employee_name,
    employeePayrollId: shift.employee_payroll_id,
    locationId: shift.location_id,
    locationName: shift.location_name,
    notes: null,
    payableEndAt: null,
    payableMinutes: 0,
    payableStartAt: null,
    publishedShiftId: shift.id,
    rotaId: shift.rota_id,
    rotaLabel: getRotaLabel(shift.rota_week_start, shift.location_name),
    scheduledEndAt: segment.endsAt.toISOString(),
    scheduledMinutes: getMinutesBetween(
      segment.startsAt.toISOString(),
      segment.endsAt.toISOString(),
      new Date()
    ),
    scheduledStartAt: segment.startsAt.toISOString(),
    scheduledTimeLabel: segment.timeLabel,
    shiftSegment: segment.key,
    timeZone: shift.time_zone,
    source: "scheduled",
    status: "scheduled",
    zoneName: shift.zone_name_snapshot,
  }
}

function getPersistedScheduledWindow(row: TimeEntryRow) {
  if (
    !row.published_day_date ||
    !row.published_shift_type ||
    !row.published_start_time
  ) {
    return null
  }

  const shift: PublishedShiftCandidate = {
    day_date: row.published_day_date,
    end_kind: row.published_end_kind,
    end_time: row.published_end_time,
    id: row.rota_published_shift_id ?? row.id,
    shift_type: row.published_shift_type,
    split_second_end_time: row.published_split_second_end_time,
    split_second_start_time: row.published_split_second_start_time,
    start_time: row.published_start_time,
    time_zone: row.time_zone,
    zone_name_snapshot: row.zone_name ?? "",
  }

  const match = toShiftMatch(shift)

  return (
    match.segments.find((segment) => segment.key === row.shift_segment) ?? null
  )
}

function getPersistedScheduleLabel(row: TimeEntryRow): string | null {
  if (
    !row.scheduled_start_at ||
    !row.published_shift_type ||
    !row.published_start_time
  ) {
    return null
  }

  return getShiftSegmentTimeLabel(
    {
      end_kind: row.published_end_kind,
      end_time: row.published_end_time,
      shift_type: row.published_shift_type,
      split_second_end_time: row.published_split_second_end_time,
      split_second_start_time: row.published_split_second_start_time,
      start_time: row.published_start_time,
    },
    row.shift_segment
  )
}

function compareEntries(left: TimesheetEntry, right: TimesheetEntry) {
  return getSortValue(left) - getSortValue(right)
}

function getSortValue(entry: TimesheetEntry) {
  return new Date(
    entry.scheduledStartAt ?? entry.clockedInAt ?? "1970-01-01T00:00:00.000Z"
  ).getTime()
}

function getEntryShiftKey(entry: TimesheetEntry) {
  if (!entry.publishedShiftId || !entry.scheduledStartAt) {
    return null
  }

  return getShiftKey({
    employeeId: entry.employeeId,
    segment: entry.shiftSegment,
    shiftId: entry.publishedShiftId,
  })
}

function getShiftKey(input: {
  employeeId: string
  segment: ClockShiftSegment
  shiftId: string
}) {
  return `${input.employeeId}:${input.shiftId}:${input.segment}`
}

function getRotaLabel(weekStart: string | null, locationName: string) {
  if (!weekStart) {
    return null
  }

  return `${locationName} rota, ${format(new Date(weekStart), "d MMM")}`
}

export { mapEntryRows }
