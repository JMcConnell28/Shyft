import type { DashboardAnnouncements } from "@/features/announcements/types"
import type { DashboardMobileContext } from "@/features/dashboard/components/dashboard-mobile-types"
import type { DashboardShiftOverview } from "@/features/dashboard/types"
import { DashboardAnnouncementsPanel } from "@/features/announcements/components/dashboard-announcements-panel"
import { DashboardClockStatusPanel } from "@/features/dashboard/components/dashboard-clock-status-panel"
import {
  NextShiftCard,
  ThisWeekShiftsCard,
} from "@/features/dashboard/components/dashboard-shift-panels"
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout"
import { MobileDashboardShell } from "@/features/dashboard/components/mobile-dashboard-shell"

function ShiftOverviewCards({
  announcements,
  organizationName,
  mobileContext,
  overview,
}: {
  announcements: DashboardAnnouncements
  organizationName: string
  mobileContext: DashboardMobileContext
  overview: DashboardShiftOverview
}) {
  const announcementsHref = `/app/${mobileContext.workspaceSlug}/announcements`

  return (
    <>
      <MobileDashboardShell
        announcements={announcements}
        announcementsHref={announcementsHref}
        clockStatus={overview.clockStatus}
        context={mobileContext}
        nextShift={overview.nextShift}
        shifts={overview.thisWeekShifts}
        weekHoursLabel={overview.weekHoursLabel}
      />
      <DashboardLayout className="@container/personal hidden max-w-[1440px] gap-6 md:flex md:pt-6">
        <header>
          <h1 className="text-2xl leading-8 font-bold tracking-tight">
            Your shift overview
          </h1>
          <p className="text-sm text-muted-foreground">
            {organizationName} · {overview.weekRangeLabel}
          </p>
        </header>
        <div className="grid items-start gap-6 @min-[44rem]/personal:grid-cols-[minmax(0,1.75fr)_minmax(16rem,1fr)]">
          <div className="grid min-w-0 gap-6">
            <ThisWeekShiftsCard shifts={overview.thisWeekShifts} />
            <DashboardAnnouncementsPanel
              announcements={announcements}
              href={announcementsHref}
            />
          </div>
          <div className="grid min-w-0 gap-6">
            <NextShiftCard shift={overview.nextShift} context={mobileContext} />
            {overview.clockStatus ? (
              <DashboardClockStatusPanel clockStatus={overview.clockStatus} />
            ) : null}
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}

export { ShiftOverviewCards }
