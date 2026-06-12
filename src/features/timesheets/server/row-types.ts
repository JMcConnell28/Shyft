import type { ClockShiftSegment } from "@/features/time-clock/types"
import type { PublishedShiftCandidate } from "@/features/time-clock/utils/shift-matching"

type ScheduledShiftRow = PublishedShiftCandidate & {
  employee_id: string
  employee_name: string
  location_id: string
  location_name: string
  rota_id: string
  rota_week_start: string
}

type TimeEntryRow = {
  clocked_in_at: string
  clocked_out_at: string | null
  employee_id: string
  employee_name: string
  id: string
  location_id: string
  location_name: string
  notes: string | null
  payable_end_at: string | null
  payable_start_at: string | null
  rota_published_shift_id: string | null
  rota_id: string | null
  rota_week_start: string | null
  scheduled_end_at: string | null
  scheduled_start_at: string | null
  shift_segment: ClockShiftSegment
  source: "employee_nfc" | "manager_override" | "adjustment"
  status: "open" | "closed" | "requires_review"
  zone_name: string | null
}

type TimesheetEmployeeRow = {
  employee_id: string
  employee_name: string
  location_name: string
}

export type { ScheduledShiftRow, TimeEntryRow, TimesheetEmployeeRow }
