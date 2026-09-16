import type { ManagerClockPageData } from "@/features/time-clock/types"
import { getElapsedMilliseconds } from "@/features/time-clock/utils/elapsed-time"

type ManagerClockStats = {
  exceptionCount: number
  openCount: number
  teamCount: number
  trackedMs: number
}

function getManagerClockStats(
  data: ManagerClockPageData,
  now: Date,
): ManagerClockStats {
  const openDurations = data.employees
    .map((employee) =>
      employee.openEntry
        ? getElapsedMilliseconds(employee.openEntry.clockedInAt, now)
        : null,
    )
    .filter((duration): duration is number => duration !== null)

  const trackedMs = data.activityEntries.reduce((total, entry) => {
    const end = entry.clockedOutAt ? new Date(entry.clockedOutAt) : now

    return total + getElapsedMilliseconds(entry.clockedInAt, end)
  }, 0)

  return {
    exceptionCount: data.reviewEntries.length + data.failedAttempts.length,
    openCount: openDurations.length,
    teamCount: data.employees.length,
    trackedMs,
  }
}

export type { ManagerClockStats }
export { getManagerClockStats }
