import { AlertTriangleIcon, CheckIcon, ShieldAlertIcon } from "lucide-react"

import type { ManagerClockPageData } from "@/features/time-clock/types"
import { Button } from "@/components/ui/button"
import { EmployeeIdentity } from "@/features/time-clock/components/employee-identity"
import {
  TimeClockEmptyState,
  TimeClockPanel,
  TimeClockPanelHeader,
  TimeClockPill,
} from "@/features/time-clock/components/time-clock-panel"
import { formatClockDateTime } from "@/features/time-clock/utils/manager-clock-formatters"

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
            <div className="flex items-center gap-3 px-4 py-3" key={entry.id}>
              <EmployeeIdentity
                name={entry.employeeName}
                secondary={`In ${formatClockDateTime(entry.clockedInAt)}`}
                size="compact"
              />
              <span className="ml-auto hidden rounded-md bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-700 sm:inline-flex">
                Review
              </span>
              <Button
                aria-label={`Approve ${entry.employeeName}'s time entry`}
                className="h-8 rounded-lg border-[#dfe4ef] bg-white px-2.5 text-[#236cff] shadow-none hover:bg-blue-50"
                disabled={
                  isApproving ||
                  !data.writableLocationIds.includes(entry.locationId)
                }
                onClick={() => onApprove(entry.id)}
                size="sm"
                variant="outline"
              >
                <CheckIcon className="size-3.5" />
                Approve
              </Button>
            </div>
          ))}
          {data.failedAttempts.slice(0, 4).map((attempt) => (
            <div className="flex items-center gap-3 px-4 py-3" key={attempt.id}>
              <EmployeeIdentity
                name={attempt.employeeName ?? "Unknown employee"}
                secondary={attempt.failureReason ?? "Clock attempt failed"}
                size="compact"
              />
              <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-700">
                <ShieldAlertIcon className="size-3" />
                Failed
              </span>
            </div>
          ))}
        </div>
      )}
    </TimeClockPanel>
  )
}

export { TimeClockExceptionsSection }
