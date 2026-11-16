import { AlertTriangleIcon, CheckIcon, ShieldAlertIcon } from "lucide-react"

import type { ManagerClockPageData } from "@/features/time-clock/types"
import { Button } from "@/components/ui/button"
import { EmployeeIdentity } from "@/features/time-clock/components/employee-identity"
import { TimeEntryNotes } from "@/features/time-clock/components/time-entry-notes"
import {
  TimeClockEmptyState,
  TimeClockPanel,
  TimeClockPanelHeader,
  TimeClockPill,
} from "@/features/time-clock/components/time-clock-panel"
import { formatClockDateTime } from "@/features/time-clock/utils/manager-clock-formatters"
import { Badge } from "@/components/panelui/badge"

function TimeClockExceptionsSection({
  data,
  isApproving,
  onApprove,
}: {
  data: ManagerClockPageData
  isApproving: boolean
  onApprove: (entryId: string) => void
}) {
  const exceptionCount = data.reviewEntries.length + data.failedAttempts.length

  return (
    <TimeClockPanel>
      <TimeClockPanelHeader
        action={<TimeClockPill>{exceptionCount}</TimeClockPill>}
        icon={AlertTriangleIcon}
        title="Exceptions"
      />
      {exceptionCount === 0 ? (
        <div className="p-4">
          <TimeClockEmptyState>Nothing needs attention.</TimeClockEmptyState>
        </div>
      ) : (
        <div className="divide-y divide-[#edf0f6]">
          {data.reviewEntries.slice(0, 4).map((entry) => (
            <div className="px-4 py-3" key={entry.id}>
              <div className="flex items-center gap-3">
                <EmployeeIdentity
                  name={entry.employeeName}
                  secondary={`In ${formatClockDateTime(entry.clockedInAt)}${
                    entry.clockedOutAt
                      ? ` · Out ${formatClockDateTime(entry.clockedOutAt)}`
                      : ""
                  }`}
                  size="compact"
                />
                <Badge
                  variant="warning"
                  size="sm"
                  className="ml-auto hidden sm:inline-flex"
                >
                  Review
                </Badge>
                <Button
                  aria-label={`Approve ${entry.employeeName}'s time entry`}
                  disabled={
                    isApproving ||
                    !data.writableLocationIds.includes(entry.locationId)
                  }
                  onClick={() => onApprove(entry.id)}
                  size="sm"
                  variant="secondary"
                >
                  <CheckIcon className="size-3.5" />
                  Approve
                </Button>
              </div>
              <TimeEntryNotes notes={entry.notes} requiresReview />
            </div>
          ))}
          {data.failedAttempts.slice(0, 4).map((attempt) => (
            <div className="flex items-center gap-3 px-4 py-3" key={attempt.id}>
              <EmployeeIdentity
                name={attempt.employeeName ?? "Unknown employee"}
                secondary={attempt.failureReason ?? "Clock attempt failed"}
                size="compact"
              />
              <Badge variant="destructive" size="sm" className="ml-auto">
                <ShieldAlertIcon className="size-3" />
                Failed
              </Badge>
            </div>
          ))}
        </div>
      )}
    </TimeClockPanel>
  )
}

export { TimeClockExceptionsSection }
