import "@tanstack/react-start/server-only"
import {
  automaticClockOutSql,
  claimClockRemindersSql,
} from "./automatic-clock-out-sql"
import type { ClockReminder } from "@/features/time-clock/types/clock-automation"
import {
  clockClosureCountSchema,
  clockReminderOpenSchema,
  clockReminderSchema,
} from "@/features/time-clock/schemas/clock-automation-schemas"
import {
  CLOCK_AUTOMATION_BATCH_SIZE,
  CLOCK_OUT_REMINDER_MINUTES,
  CLOCK_REMINDER_LEASE_MINUTES,
  SCHEDULED_CLOCK_OUT_DELAY_MINUTES,
  UNSCHEDULED_CLOCK_OUT_LIMIT_MINUTES,
  UNSCHEDULED_CLOCK_OUT_REMINDER_MINUTES,
} from "@/features/time-clock/constants/automatic-clock-out"
import { getDatabase } from "@/lib/db"

async function closeOverdueClockEntries(now: Date): Promise<number> {
  const result = await getDatabase().query(automaticClockOutSql, [
    now.toISOString(),
    SCHEDULED_CLOCK_OUT_DELAY_MINUTES,
    UNSCHEDULED_CLOCK_OUT_LIMIT_MINUTES,
    CLOCK_AUTOMATION_BATCH_SIZE,
  ])
  return clockClosureCountSchema.parse(result.rows[0]).closed
}

async function claimClockReminders(now: Date): Promise<Array<ClockReminder>> {
  const result = await getDatabase().query(claimClockRemindersSql, [
    now.toISOString(),
    CLOCK_OUT_REMINDER_MINUTES,
    SCHEDULED_CLOCK_OUT_DELAY_MINUTES,
    UNSCHEDULED_CLOCK_OUT_LIMIT_MINUTES,
    CLOCK_REMINDER_LEASE_MINUTES,
    CLOCK_AUTOMATION_BATCH_SIZE,
    UNSCHEDULED_CLOCK_OUT_REMINDER_MINUTES,
  ])
  return clockReminderSchema.array().parse(result.rows)
}

async function finishClockReminder(
  id: string,
  claimedAt: Date,
  delivered: boolean
): Promise<void> {
  await getDatabase().query(
    `update public.time_entries
     set clock_out_reminder_sent_at = case when $3 then $2::timestamptz else null end,
         clock_out_reminder_claimed_at = null
     where id = $1::uuid and clock_out_reminder_claimed_at = $2::timestamptz`,
    [id, claimedAt.toISOString(), delivered]
  )
}

async function isClockReminderOpen(id: string): Promise<boolean> {
  const result = await getDatabase().query(
    `select exists(select 1 from public.time_entries where id = $1::uuid and clocked_out_at is null) as open`,
    [id]
  )
  return clockReminderOpenSchema.parse(result.rows[0]).open
}

export {
  closeOverdueClockEntries,
  claimClockReminders,
  finishClockReminder,
  isClockReminderOpen,
}
