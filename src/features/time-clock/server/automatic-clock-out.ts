import "@tanstack/react-start/server-only"
import {
  claimClockReminders,
  closeOverdueClockEntries,
  finishClockReminder,
  isClockReminderOpen,
} from "./automatic-clock-out-data"
import type { ClockReminder } from "@/features/time-clock/types/clock-automation"
import { sendPushToUser } from "@/features/push-notifications/server/push-service"
import { getWorkspaceDashboardPath } from "@/lib/organization-paths"
import { formatMinuteOption } from "@/features/time-clock/constants/clock-settings-options"

type ClockAutomationResult = {
  closed: number
  reminders: number
  failed: number
}

async function processAutomaticClockOuts(
  now = new Date()
): Promise<ClockAutomationResult> {
  // Closure does not depend on push availability. Database row locks protect
  // actual punches and prevent different server instances closing an entry twice.
  const closed = await closeOverdueClockEntries(now)
  const reminders = await claimClockReminders(now)
  const result = { closed, reminders: 0, failed: 0 }
  for (let index = 0; index < reminders.length; index += 10) {
    await Promise.all(
      reminders.slice(index, index + 10).map(async (reminder) => {
        try {
          const delivered = await sendClockReminder(reminder)
          await finishClockReminder(reminder.id, now, delivered)
          if (delivered) result.reminders++
          else result.failed++
        } catch (error) {
          result.failed++
          // The lease expires so a process crash or transient push failure can retry.
          console.error("Clock-out reminder failed", {
            entryId: reminder.id,
            error,
          })
        }
      })
    )
  }
  return result
}

async function sendClockReminder(reminder: ClockReminder): Promise<boolean> {
  if (!reminder.userId || !(await isClockReminderOpen(reminder.id))) return true
  const summary = await sendPushToUser(reminder.userId, {
    title: "Did you forget to clock out?",
    body: reminder.scheduled
      ? "Your scheduled shift has ended and you are still clocked in. If you have finished, tap your clock tag to clock out."
      : `You are approaching the ${formatMinuteOption(reminder.limitMinutes)} limit for an unscheduled shift. If you have finished, tap your clock tag to clock out.`,
    tag: `clock-out-${reminder.id}`,
    data: {
      notificationId: reminder.id,
      url: getWorkspaceDashboardPath(reminder.workspaceSlug),
    },
  })
  // No devices is a completed delivery attempt; partial delivery must not spam
  // working devices every minute when a different device is unavailable.
  return summary.sent > 0 || summary.failed === 0
}

export { processAutomaticClockOuts }
