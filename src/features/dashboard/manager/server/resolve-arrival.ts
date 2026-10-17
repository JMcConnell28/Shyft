import "@tanstack/react-start/server-only"

import {
  requireDashboardLocation,
  resolveManagerDashboardAccess,
} from "./access"
import { dashboardScheduleSql, matchingArrivalSql } from "./schedule-sql"
import type { ResolveArrivalInput } from "../types"
import { getDatabase } from "@/lib/db"
import { requireTimeAttendanceAccess } from "@/features/billing/server/entitlements"

async function resolveDashboardArrival(
  input: ResolveArrivalInput
): Promise<{ success: true }> {
  const access = await resolveManagerDashboardAccess(input.organizationId)
  const location = requireDashboardLocation(access.locations, input.locationId)
  if (
    !access.capabilities.canManageTimeClock ||
    !location.attendanceEnabled ||
    !location.canWrite
  ) {
    throw new Error("You cannot resolve attendance issues for this location.")
  }
  await requireTimeAttendanceAccess(location.id)
  const result = await getDatabase().query(
    `with ${dashboardScheduleSql}
     insert into public.dashboard_arrival_resolutions
       (organization_id, location_id, assignment_id, employee_id, shift_key, shift_segment, scheduled_start_at, reason, resolved_by)
     select $1, w.location_id, w.assignment_id, w.employee_id, w.shift_key, w.segment, w.starts_at, $6, $7
     from schedule_windows w
     where w.assignment_id = $3::uuid and w.segment = $4 and w.starts_at = $5::timestamptz
       and w.starts_at + make_interval(mins => w.late_grace) < $8::timestamptz
       and not exists (${matchingArrivalSql})
     on conflict (location_id, employee_id, shift_key, shift_segment, scheduled_start_at) do nothing
     returning id`,
    [
      input.organizationId,
      [location.id],
      input.assignmentId,
      input.segment,
      input.scheduledStartAt,
      input.reason,
      access.userId,
      new Date().toISOString(),
    ]
  )
  if (result.rowCount !== 1)
    throw new Error(
      "This arrival has changed or was already reviewed. Refresh the dashboard."
    )
  return { success: true }
}
export { resolveDashboardArrival }
