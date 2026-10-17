import { formatDashboardTime } from "../utils/date"
import type { DashboardLocation } from "../types"

function DashboardStaffingStatus({
  status,
  updatedAt,
  timeZone,
  timeFormat,
}: {
  status: "pending" | "error" | "success"
  updatedAt: string
  timeZone: string
  timeFormat: DashboardLocation["timeFormat"]
}) {
  if (status === "pending") return <> · Loading staffing…</>
  if (status === "error") return <> · Could not load staffing</>

  return (
    <>
      {" · Updated "}
      <time dateTime={updatedAt}>
        {formatDashboardTime(updatedAt, timeZone, timeFormat)}
      </time>
    </>
  )
}

export { DashboardStaffingStatus }
