import type { DashboardAnnouncements } from "@/features/announcements/types"
import { DashboardAnnouncementsPanel } from "@/features/announcements/components/dashboard-announcements-panel"
import type { DashboardMobileContext } from "@/features/dashboard/components/dashboard-mobile-types"
import { DashboardClockStatusPanel } from "@/features/dashboard/components/dashboard-clock-status-panel"
import {
  NextShiftCard,
  ThisWeekShiftsCard,
} from "@/features/dashboard/components/dashboard-shift-panels"
import { DashboardSummaryStrip } from "@/features/dashboard/components/dashboard-summary-strip"
import { MobileDashboardShell } from "@/features/dashboard/components/mobile-dashboard-shell"
import type { DashboardShiftOverview } from "@/features/dashboard/types"

function ShiftOverviewCards({
  announcements,
  mobileContext,
  overview,
}: {
  announcements: DashboardAnnouncements
  mobileContext: DashboardMobileContext
  overview: DashboardShiftOverview
}) {
  const announcementsHref = `/w/${mobileContext.workspaceSlug}/announcements`

  return (
    <>
      <MobileDashboardShell
        announcements={announcements}
        announcementsHref={announcementsHref}
        clockStatus={overview.clockStatus}
        context={mobileContext}
        nextShift={overview.nextShift}
        shifts={overview.thisWeekShifts}
        weekRangeLabel={overview.weekRangeLabel}
      />
      <div className="hidden flex-col gap-4 md:flex">
        <DashboardSummaryStrip overview={overview} />
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(22rem,0.78fr)_minmax(0,1.22fr)]">
          <div className="space-y-4">
            <DashboardClockStatusPanel clockStatus={overview.clockStatus} />
            <DashboardAnnouncementsPanel
              announcements={announcements}
              href={announcementsHref}
            />
          </div>
          <div className="space-y-4">
            <NextShiftCard shift={overview.nextShift} />
            <ThisWeekShiftsCard shifts={overview.thisWeekShifts} />
          </div>
        </div>
      </div>
    </>
  )
}

export { ShiftOverviewCards }
