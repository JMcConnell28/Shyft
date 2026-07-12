import "@tanstack/react-start/server-only"

import { randomUUID } from "node:crypto"
import { format } from "date-fns"

import type { RotaPublishedShift } from "@/features/email/templates/rota-published"
import { sendRotaPublishedEmail } from "@/features/email/server/rota-emails"
import { buildAppUrl } from "@/lib/app-url.server"
import { getDatabase } from "@/lib/db"
import { sendPushToUsers } from "@/features/push-notifications/server/push-service"

type RotaPublishedEmailRow = {
  employee_email: string | null
  employee_name: string
  location_name: string
  location_slug: string
  organization_id: string | null
  organization_slug: string | null
  shift_day_date: Date | string
  shift_end_kind: string | null
  shift_end_time: string | null
  shift_split_second_end_time: string | null
  shift_split_second_start_time: string | null
  shift_start_time: string
  shift_type: string
  user_email: string | null
  user_id: string | null
  week_start: Date | string
  zone_name: string | null
}

type RotaEmailRecipient = {
  email: string
  locationName: string
  shifts: Array<RotaPublishedShift>
  userName: string
  weekLabel: string
}

type RotaPublishedNotificationResult = {
  errorMessage?: string
  pushSentCount?: number
  sentCount: number
}

async function sendRotaPublishedNotifications(input: {
  orgSlug: string
  isOrganizationWorkspace: boolean
  locationSlug: string
  rotaId: string
}) {
  try {
    const rows = await listRotaPublishedEmailRows(input.rotaId)
    const recipients = mapRotaPublishedRecipients(rows)
    const rotaUrl = buildAppUrl(getPublishedRotaPath(input))

    await Promise.all(
      recipients.map((recipient) =>
        sendRotaPublishedEmail({
          to: recipient.email,
          locationName: recipient.locationName,
          rotaUrl,
          shifts: recipient.shifts,
          userName: recipient.userName,
          weekLabel: recipient.weekLabel,
        })
      )
    )

    const userIds = [
      ...new Set(
        rows.map((row) => row.user_id).filter((id): id is string => Boolean(id))
      ),
    ]
    let pushSentCount = 0

    try {
      const weekLabel = rows[0]
        ? formatWeekLabel(rows[0].week_start)
        : "your upcoming week"
      const pushSummary = await sendPushToUsers(userIds, {
        title: "New rota published",
        body: `Your rota for ${weekLabel} is ready.`,
        tag: `rota-published-${input.rotaId}`,
        data: {
          notificationId: randomUUID(),
          url: getPublishedRotaPath(input),
        },
      })
      pushSentCount = pushSummary.sent
    } catch (error) {
      console.error("Rota Web Push notifications failed", {
        rotaId: input.rotaId,
        message: error instanceof Error ? error.message : "Unknown push error",
      })
    }

    console.info(
      `Rota published email notifications sent for ${input.rotaId}: ${recipients.length}`
    )

    return {
      sentCount: recipients.length,
      pushSentCount,
    } satisfies RotaPublishedNotificationResult
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Email delivery failed."

    console.error("Rota published email delivery failed.", error)

    return {
      errorMessage,
      sentCount: 0,
    } satisfies RotaPublishedNotificationResult
  }
}

async function listRotaPublishedEmailRows(rotaId: string) {
  const result = await getDatabase().query<RotaPublishedEmailRow>(
    `select
       employee.full_name as employee_name,
       employee.email as employee_email,
       account_user.email as user_email,
       account_user.id as user_id,
       location.name as location_name,
       location.slug as location_slug,
       organization.slug as organization_slug,
       rota.organization_id,
       rota.week_start,
       published_shift.day_date as shift_day_date,
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
     left join public."organization" organization
       on organization.id = rota.organization_id
     join public.employees employee on employee.id = assignment.employee_id
     left join public."user" account_user on account_user.id = employee.user_id
     where published_shift.rota_id = $1
     order by employee.full_name asc,
              published_shift.day_date asc,
              published_shift.start_time asc`,
    [rotaId]
  )

  return result.rows
}

function mapRotaPublishedRecipients(rows: Array<RotaPublishedEmailRow>) {
  const recipientsByEmail = new Map<string, RotaEmailRecipient>()

  for (const row of rows) {
    const email = row.employee_email ?? row.user_email

    if (!email) {
      continue
    }

    const recipient = recipientsByEmail.get(email) ?? {
      email,
      locationName: row.location_name,
      shifts: [],
      userName: row.employee_name,
      weekLabel: formatWeekLabel(row.week_start),
    }

    recipient.shifts.push({
      dayLabel: format(new Date(row.shift_day_date), "EEE d MMM"),
      timeLabel: getPublishedShiftTimeLabel(row),
      zoneName: row.zone_name,
    })
    recipientsByEmail.set(email, recipient)
  }

  return Array.from(recipientsByEmail.values())
}

function getPublishedRotaPath(input: {
  orgSlug: string
  isOrganizationWorkspace: boolean
  locationSlug: string
  rotaId: string
}) {
  if (!input.isOrganizationWorkspace) {
    return `/w/${input.locationSlug}/rota/${input.rotaId}/view`
  }

  return `/w/${input.orgSlug}/rota/${input.locationSlug}/${input.rotaId}/view`
}

function formatWeekLabel(weekStart: Date | string) {
  const startDate = new Date(weekStart)
  const endDate = new Date(startDate)
  endDate.setUTCDate(endDate.getUTCDate() + 6)

  return `${format(startDate, "d MMM")} - ${format(endDate, "d MMM yyyy")}`
}

function getPublishedShiftTimeLabel(row: RotaPublishedEmailRow) {
  const startTime = formatClockTime(row.shift_start_time)

  if (row.shift_type === "closing") {
    return `${startTime} - Close`
  }

  if (row.shift_type === "split") {
    const firstEnd =
      row.shift_end_kind === "locationClose"
        ? "Close"
        : formatClockTime(row.shift_end_time ?? row.shift_start_time)
    const secondStart = formatClockTime(
      row.shift_split_second_start_time ?? row.shift_start_time
    )
    const secondEnd = row.shift_split_second_end_time ?? secondStart

    return `${startTime} - ${firstEnd}, ${secondStart} - ${formatClockTime(secondEnd)}`
  }

  return `${startTime} - ${formatClockTime(row.shift_end_time ?? row.shift_start_time)}`
}

function formatClockTime(value: string) {
  return value.slice(0, 5)
}

export { sendRotaPublishedNotifications }
export type { RotaPublishedNotificationResult }
