import "@tanstack/react-start/server-only"

import { z } from "zod"
import { getDashboardDayWindow, getDashboardWeekStart } from "../utils/date"
import { dashboardScheduleSql } from "./schedule-sql"
import {
  attendanceRowSchema,
  planningRowSchema,
  scheduleRowSchema,
} from "./record-schemas"
import type { DashboardLocation, PlanningWeek } from "../types"
import { getDatabase } from "@/lib/db"

async function listDashboardSchedule(
  organizationId: string,
  location: DashboardLocation,
  date: string
) {
  const window = getDashboardDayWindow(date, location.timeZone)
  const result = await getDatabase().query(
    `with ${dashboardScheduleSql}
     select w.assignment_id, w.employee_id, w.employee_name, w.employee_status, w.day_date::text,
            w.shift_id, w.rota_id,
            w.zone, w.segment, w.starts_at, w.ends_at, w.is_closing,
            resolution.reason as resolution_reason
     from schedule_windows w
     left join public.dashboard_arrival_resolutions resolution
       on resolution.location_id = w.location_id and resolution.employee_id = w.employee_id
       and resolution.shift_key = w.shift_key and resolution.shift_segment = w.segment
       and resolution.scheduled_start_at = w.starts_at
     where w.day_date = $3::date or (w.starts_at < $5::timestamptz and w.ends_at > $4::timestamptz)
     order by w.starts_at, w.employee_name`,
    [organizationId, [location.id], date, window.start, window.end]
  )
  return z.array(scheduleRowSchema).parse(result.rows)
}

async function listDashboardAttendance(
  organizationId: string,
  location: DashboardLocation,
  date: string,
  now: Date
) {
  if (!location.attendanceEnabled) return []
  const window = getDashboardDayWindow(date, location.timeZone)
  const result = await getDatabase().query(
    `select te.id, te.employee_id, e.full_name as employee_name, e.status as employee_status,
            te.rota_published_shift_id, te.shift_segment, te.clocked_in_at,
            te.clocked_out_at, te.scheduled_end_at, te.status, te.source, te.notes,
            s.zone_name_snapshot as zone, s.rota_id
     from public.time_entries te
     join public.employees e on e.id = te.employee_id
     left join public.rota_published_shifts s on s.id = te.rota_published_shift_id
     where te.organization_id = $1 and te.location_id = $2::uuid
       and ((te.clocked_in_at < $4::timestamptz
         and coalesce(te.clocked_out_at, $6::timestamptz) > $3::timestamptz)
         or s.day_date = $5::date)
     order by te.clocked_in_at`,
    [
      organizationId,
      location.id,
      window.start,
      window.end,
      date,
      now.toISOString(),
    ]
  )
  return z.array(attendanceRowSchema).parse(result.rows)
}

async function listDashboardPlanning(
  organizationId: string,
  locationId: string,
  today: string
): Promise<Array<PlanningWeek>> {
  const result = await getDatabase().query(
    `select weeks.week_start::text, r.id as rota_id, coalesce(r.status, 'not_started') as status,
            coalesce(r.has_unpublished_changes, false) as has_changes,
            (select count(*)::int from public.rota_shifts s where s.rota_id = r.id
               and not exists (select 1 from public.rota_shift_assignments a where a.rota_shift_id = s.id)) as unfilled
     from (values ($3::date), ($3::date + 7)) as weeks(week_start)
     left join public.rotas r on r.organization_id = $1 and r.location_id = $2::uuid
       and r.week_start = weeks.week_start
     order by weeks.week_start`,
    [organizationId, locationId, getDashboardWeekStart(today)]
  )
  return z
    .array(planningRowSchema)
    .parse(result.rows)
    .map((row) => ({
      weekStart: row.week_start,
      rotaId: row.rota_id,
      status: row.status,
      hasChanges: row.has_changes,
      unfilled: row.unfilled,
    }))
}

export { listDashboardSchedule, listDashboardAttendance, listDashboardPlanning }
