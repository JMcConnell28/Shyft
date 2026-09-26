import "@tanstack/react-start/server-only"

import type {
  PublishedShiftDetails,
  RotaPublishedRecipient,
} from "@/features/email/types/rota-published"
import { mapPublishedShift } from "@/features/email/utils/map-published-shift"
import { getDatabase } from "@/lib/db"

type PublishedShiftEmailRow = PublishedShiftDetails & {
  employee_email: string | null
  location_name: string
  shift_swaps_enabled: boolean | null
  user_email: string | null
  user_id: string | null
  week_start: string
}

async function listRotaPublishedEmailRecipients(rotaId: string): Promise<{
  recipients: Array<RotaPublishedRecipient>
  userIds: Array<string>
  weekStart: string | null
}> {
  const result = await getDatabase().query<PublishedShiftEmailRow>(
    `select
       employee.email as employee_email,
       account_user.email as user_email,
       account_user.id as user_id,
       location.name as location_name,
       location.estimated_closing_time::text as estimated_closing_time,
       location.estimated_closing_time_next_day,
       operating_hours.close_time::text as location_close_time,
       operating_hours.close_time_next_day as location_close_time_next_day,
       organization.shift_swaps_enabled,
       rota.week_start::text as week_start,
       published_shift.day_date::text as shift_day_date,
       published_shift.start_time::text as shift_start_time,
       published_shift.end_time::text as shift_end_time,
       published_shift.end_kind as shift_end_kind,
       published_shift.shift_type,
       published_shift.split_second_start_time::text as shift_split_second_start_time,
       published_shift.split_second_end_time::text as shift_split_second_end_time,
       published_shift.zone_name_snapshot as zone_name
     from public.rota_published_shift_assignments assignment
     join public.rota_published_shifts published_shift
       on published_shift.id = assignment.rota_published_shift_id
     join public.rotas rota on rota.id = published_shift.rota_id
     join public.locations location on location.id = rota.location_id
     left join public.location_operating_hours operating_hours
       on operating_hours.location_id = location.id
      and operating_hours.weekday = extract(isodow from published_shift.day_date)::int
     left join public."organization" organization
       on organization.id = rota.organization_id
     join public.employees employee on employee.id = assignment.employee_id
     join public.employee_location_assignments active_location_assignment
       on active_location_assignment.employee_id = employee.id
      and active_location_assignment.location_id = rota.location_id
      and active_location_assignment.is_enabled = true
      and active_location_assignment.disabled_at is null
     left join public."user" account_user on account_user.id = employee.user_id
     where published_shift.rota_id = $1
       and employee.status = 'active'
     order by employee.full_name asc,
              published_shift.day_date asc,
              published_shift.start_time asc`,
    [rotaId]
  )

  const recipientsByEmail = new Map<string, RotaPublishedRecipient>()
  const userIds = new Set<string>()

  for (const row of result.rows) {
    if (row.user_id) userIds.add(row.user_id)

    const email = row.employee_email ?? row.user_email
    if (!email) continue

    const recipient = recipientsByEmail.get(email) ?? {
      email,
      locationName: row.location_name,
      shifts: [],
      shiftSwapsEnabled: row.shift_swaps_enabled ?? true,
      weekStart: row.week_start,
    }

    recipient.shifts.push(mapPublishedShift(row))
    recipientsByEmail.set(email, recipient)
  }

  return {
    recipients: [...recipientsByEmail.values()],
    userIds: [...userIds],
    weekStart: result.rows[0]?.week_start ?? null,
  }
}

export { listRotaPublishedEmailRecipients }
