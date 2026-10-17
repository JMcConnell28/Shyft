import type { AttendanceRow, ScheduleRow } from "./server/record-schemas"
import type { DashboardLocation } from "./types"

const dashboardLocation: DashboardLocation = {
  id: "10000000-0000-4000-8000-000000000001",
  name: "Main Bar",
  slug: "main-bar",
  timeZone: "Europe/London",
  timeFormat: "24h",
  attendanceEnabled: true,
  canWrite: true,
  lateGraceMinutes: 5,
}
const dashboardSchedule: ScheduleRow = {
  assignment_id: "20000000-0000-4000-8000-000000000001",
  employee_id: "30000000-0000-4000-8000-000000000001",
  employee_name: "Sam",
  employee_status: "active",
  day_date: "2026-10-16",
  shift_id: "40000000-0000-4000-8000-000000000001",
  rota_id: "50000000-0000-4000-8000-000000000001",
  zone: "Bar",
  segment: "full",
  starts_at: "2026-10-16T08:00:00.000Z",
  ends_at: "2026-10-16T16:00:00.000Z",
  is_closing: false,
  resolution_reason: null,
}
const dashboardAttendance: AttendanceRow = {
  id: "60000000-0000-4000-8000-000000000001",
  employee_id: dashboardSchedule.employee_id,
  employee_name: "Sam",
  employee_status: "active",
  rota_published_shift_id: dashboardSchedule.shift_id,
  shift_segment: "full",
  clocked_in_at: "2026-10-16T08:03:00.000Z",
  clocked_out_at: null,
  scheduled_end_at: dashboardSchedule.ends_at,
  source: "employee_nfc",
  status: "open",
  notes: null,
  zone: "Bar",
  rota_id: dashboardSchedule.rota_id,
}
export { dashboardLocation, dashboardSchedule, dashboardAttendance }
