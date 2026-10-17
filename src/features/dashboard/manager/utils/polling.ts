import type { ManagerDayData } from "../types"
import { getDateKeyInTimeZone } from "@/lib/time-zone"

function getDashboardPollingInterval(
  date: string | undefined,
  data: Pick<ManagerDayData, "isToday" | "location"> | undefined,
  now = new Date()
): number | false {
  if (!data) return false
  if (date && date !== getDateKeyInTimeZone(now, data.location.timeZone)) {
    return data.isToday ? 1000 : false
  }
  return data.location.attendanceEnabled ? 30000 : 60000
}
export { getDashboardPollingInterval }
