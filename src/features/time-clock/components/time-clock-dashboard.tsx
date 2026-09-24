import type {
  ClockAction,
  ManagerClockEmployee,
  ManagerClockPageData,
} from "@/features/time-clock/types"
import type { ManagerClockStats } from "@/features/time-clock/utils/manager-clock-stats"
import { ClockedInSection } from "@/features/time-clock/components/clocked-in-section"
import { ManualClockActions } from "@/features/time-clock/components/manual-clock-actions"
import { TimeClockActivitySection } from "@/features/time-clock/components/time-clock-activity-section"
import { TimeClockExceptionsSection } from "@/features/time-clock/components/time-clock-exceptions-section"
import { TimeClockHeader } from "@/features/time-clock/components/time-clock-header"
import { TimeClockStatsGrid } from "@/features/time-clock/components/time-clock-stats-grid"

type TimeClockDashboardProps = {
  data: ManagerClockPageData
  isApproving: boolean
  isRefreshing: boolean
  liveNow: Date
  onApprove: (entryId: string) => void
  onManualAction: (action: ClockAction, employee?: ManagerClockEmployee) => void
  onRefresh: () => void
  stats: ManagerClockStats
  workspaceSlug: string
}

function TimeClockDashboard({
  data,
  isApproving,
  isRefreshing,
  liveNow,
  onApprove,
  onManualAction,
  onRefresh,
  stats,
  workspaceSlug,
}: TimeClockDashboardProps) {
  return (
    <main className="flex flex-1 bg-[#f6f8fc] px-4 py-5 text-[#10204b] sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-4 sm:gap-5">
        <TimeClockHeader
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          selectedDate={data.selectedDate}
          workspaceSlug={workspaceSlug}
        />
        <TimeClockStatsGrid stats={stats} />

        <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(19rem,0.8fr)]">
          <div className="hidden md:block">
            <ClockedInSection
              employees={data.employees}
              liveNow={liveNow}
              writableLocationIds={data.writableLocationIds}
              onClockOut={(employee) => onManualAction("clock_out", employee)}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
            <ManualClockActions
              disabled={data.writableLocationIds.length === 0}
              onAction={onManualAction}
            />
            <TimeClockExceptionsSection
              data={data}
              isApproving={isApproving}
              onApprove={onApprove}
            />
          </div>
        </div>

        <TimeClockActivitySection
          entries={data.activityEntries}
          liveNow={liveNow}
          workspaceSlug={workspaceSlug}
        />
      </div>
    </main>
  )
}

export { TimeClockDashboard }
