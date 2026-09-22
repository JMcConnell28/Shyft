import type { PoolClient } from "pg"

import type { WorkspaceAssignment } from "@/features/rota/types/workspace"
import {
  buildWorkspaceDays,
  buildWorkspaceLocation,
  mapShiftRowToWorkspaceShift,
} from "@/features/rota/server/workspace-shared"
import { calculateRotaSummary } from "@/features/rota/utils/rota-summary"
import { getCurrentWeekStart } from "@/features/rota/utils/week-utils"

type ClosingTimeSetting = {
  closeTime: string
  closeTimeNextDay: boolean
  weekday: number
}

type LocationRotaRow = {
  id: string
  week_start: string | Date
}

type LocationShiftRow = {
  day_date: string
  end_kind: string | null
  end_time: string | null
  id: string
  rota_id: string
  shift_type: string
  split_second_end_time: string | null
  split_second_start_time: string | null
  start_time: string
  zone_id: string | null
  zone_name_snapshot: string
}

type LocationAssignmentRow = {
  employee_id: string
  rota_id: string
  rota_shift_id: string
}

async function refreshLocationClosingShiftSummaries(input: {
  client: PoolClient
  closingTimes: Array<ClosingTimeSetting>
  estimatedClosingTime: string
  estimatedClosingTimeNextDay: boolean
  locationId: string
  organizationId: string | null
}) {
  const rotasResult = await input.client.query<LocationRotaRow>(
    `select rota.id, rota.week_start
     from public.rotas rota
     where rota.location_id = $1
       and (
         ($2::text is null and rota.organization_id is null)
         or rota.organization_id = $2::text
       )
       and rota.week_start >= $3::date
       and exists (
         select 1
         from public.rota_shifts shift
         where shift.rota_id = rota.id
           and shift.end_kind = 'location_close'
       )`,
    [input.locationId, input.organizationId, getCurrentWeekStart()]
  )

  const rotaIds = rotasResult.rows.map((rota) => rota.id)

  if (rotaIds.length === 0) {
    return
  }

  const shiftsResult = await input.client.query<LocationShiftRow>(
    `select
       shift.id,
       shift.rota_id,
       shift.day_date,
       shift.zone_id,
       shift.zone_name_snapshot,
       shift.shift_type,
       shift.start_time,
       shift.end_time,
       shift.end_kind,
       shift.split_second_start_time,
       shift.split_second_end_time
     from public.rota_shifts shift
     where shift.rota_id = any($1::uuid[])`,
    [rotaIds]
  )
  const assignmentsResult = await input.client.query<LocationAssignmentRow>(
    `select
       shift.rota_id,
       assignment.rota_shift_id,
       assignment.employee_id
     from public.rota_shift_assignments assignment
     join public.rota_shifts shift on shift.id = assignment.rota_shift_id
     where shift.rota_id = any($1::uuid[])`,
    [rotaIds]
  )
  const operatingHours = input.closingTimes.map((closingTime) => ({
    close_time: closingTime.closeTime,
    close_time_next_day: closingTime.closeTimeNextDay,
    weekday: closingTime.weekday,
  }))

  for (const rota of rotasResult.rows) {
    const days = buildWorkspaceDays(rota.week_start)
    const location = buildWorkspaceLocation(
      {
        id: input.locationId,
        name: "",
        estimatedClosingTime: input.estimatedClosingTime,
        estimatedClosingTimeNextDay: input.estimatedClosingTimeNextDay,
      },
      days,
      operatingHours
    )
    const shifts = shiftsResult.rows
      .filter((shift) => shift.rota_id === rota.id)
      .map((shift) => mapShiftRowToWorkspaceShift(shift, days))
    const assignments = assignmentsResult.rows
      .filter((assignment) => assignment.rota_id === rota.id)
      .map(
        (assignment) =>
          ({
            employeeId: assignment.employee_id,
            shiftId: assignment.rota_shift_id,
          }) satisfies Pick<WorkspaceAssignment, "employeeId" | "shiftId">
      )
    const summary = calculateRotaSummary({ assignments, location, shifts })

    await input.client.query(
      `update public.rotas
       set scheduled_hours = $2,
           scheduled_staff_count = $3,
           shift_count = $4,
           updated_at = timezone('utc', now())
       where id = $1`,
      [
        rota.id,
        summary.scheduledHours,
        summary.scheduledStaffCount,
        summary.shiftCount,
      ]
    )
  }
}

export { refreshLocationClosingShiftSummaries }
