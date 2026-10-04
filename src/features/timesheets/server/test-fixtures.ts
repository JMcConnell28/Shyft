import type {
  TimeEntryRow,
  TimesheetEmployeeRow,
} from "@/features/timesheets/server/row-types"
import type { TimesheetAccessScope } from "@/features/timesheets/server/access"

const timesheetScope: TimesheetAccessScope = {
  canManage: true,
  locationIds: ["location-1"],
  locations: [{ id: "location-1", name: "Main Bar" }],
  organizationId: "org-1",
  userId: "user-1",
}

const timesheetEmployee: TimesheetEmployeeRow = {
  employee_id: "employee-1",
  employee_name: "Sam",
  employee_payroll_id: "42",
  location_name: "Main Bar",
}

const standaloneTimeEntry: TimeEntryRow = {
  ...timesheetEmployee,
  id: "entry-1",
  location_id: "location-1",
  time_zone: "Europe/London",
  clocked_in_at: "2026-06-01T08:00:00Z",
  clocked_out_at: "2026-06-01T16:00:00Z",
  payable_start_at: "2026-06-01T08:00:00Z",
  payable_end_at: "2026-06-01T16:00:00Z",
  scheduled_start_at: null,
  scheduled_end_at: null,
  published_day_date: null,
  published_end_kind: null,
  published_end_time: null,
  published_shift_type: null,
  published_split_second_end_time: null,
  published_split_second_start_time: null,
  published_start_time: null,
  rota_published_shift_id: null,
  rota_id: null,
  rota_week_start: null,
  shift_segment: "full",
  source: "manager_override",
  status: "closed",
  notes: null,
  zone_name: null,
}

export { standaloneTimeEntry, timesheetEmployee, timesheetScope }
