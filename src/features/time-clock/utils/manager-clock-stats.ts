import type { ManagerClockPageData } from "@/features/time-clock/types"
import { getElapsedMilliseconds } from "@/features/time-clock/utils/elapsed-time"

type ManagerClockStats = {
  averageElapsedMs: number
  longestElapsedMs: number
  openCount: number
  reviewCount: number
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

  const totalElapsedMs = openDurations.reduce(
    (total, duration) => total + duration,
    0,
  )

  return {
    averageElapsedMs:
      openDurations.length > 0 ? totalElapsedMs / openDurations.length : 0,
    longestElapsedMs: Math.max(0, ...openDurations),
    openCount: openDurations.length,
    reviewCount: data.reviewEntries.length,
  }
}

export type { ManagerClockStats }
export { getManagerClockStats }
