import { CalendarDaysIcon, ClockIcon, MapPinIcon } from "lucide-react"

import type {
  DashboardShiftOverview,
  DashboardShiftSummary,
} from "@/features/dashboard/types"
import type { DashboardMobileContext } from "@/features/dashboard/components/dashboard-mobile-types"
import { DashboardClockStatusPanel } from "@/features/dashboard/components/dashboard-clock-status-panel"
import { MobileDashboardShell } from "@/features/dashboard/components/mobile-dashboard-shell"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

function ShiftOverviewCards({
  mobileContext,
  overview,
}: {
  mobileContext: DashboardMobileContext
  overview: DashboardShiftOverview
}) {
  return (
    <>
      <MobileDashboardShell
        clockStatus={overview.clockStatus}
        context={mobileContext}
        nextShift={overview.nextShift}
        shifts={overview.thisWeekShifts}
        weekRangeLabel={overview.weekRangeLabel}
      />
      <div className="hidden gap-4 md:grid xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <DashboardClockStatusPanel clockStatus={overview.clockStatus} />
          <NextShiftCard shift={overview.nextShift} />
        </div>
        <ThisWeekShiftsCard shifts={overview.thisWeekShifts} />
      </div>
    </>
  )
}

function NextShiftCard({ shift }: { shift: DashboardShiftSummary | null }) {
  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm">Next shift</CardTitle>
          {shift ? <Badge variant="outline">{shift.dayLabel}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        {shift ? (
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-semibold tracking-tight">
                {shift.dateLabel}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {shift.locationName}
              </p>
            </div>

            <ShiftMetaGrid shift={shift} />
          </div>
        ) : (
          <Empty className="border border-dashed border-border/70 bg-muted/10 py-8">
            <EmptyHeader>
              <EmptyTitle>No upcoming shift</EmptyTitle>
              <EmptyDescription>
                Published shifts assigned to you will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}

function ThisWeekShiftsCard({ shifts }: { shifts: DashboardShiftSummary[] }) {
  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm">Your shifts this week</CardTitle>
          <Badge variant="outline">
            {shifts.length} shift{shifts.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {shifts.length === 0 ? (
          <Empty className="border border-dashed border-border/70 bg-muted/10 py-8">
            <EmptyHeader>
              <EmptyTitle>No shifts this week</EmptyTitle>
              <EmptyDescription>
                When a published rota includes you, your shifts will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="divide-y divide-border/70 overflow-hidden rounded-lg border border-border/70">
            {shifts.map((shift) => (
              <ShiftListRow key={shift.id} shift={shift} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ShiftListRow({ shift }: { shift: DashboardShiftSummary }) {
  return (
    <div className="grid gap-3 bg-background px-3 py-3 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center">
      <div>
        <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {shift.dayLabel}
        </p>
        <p className="text-sm font-semibold text-foreground">{shift.dateLabel}</p>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {shift.zoneName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {shift.locationName}
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground sm:justify-end">
        <ClockIcon className="size-3.5 text-muted-foreground" />
        <span>{shift.timeLabel}</span>
      </div>
    </div>
  )
}

function ShiftMetaGrid({ shift }: { shift: DashboardShiftSummary }) {
  const meta = [
    {
      icon: ClockIcon,
      label: "Time",
      value: shift.timeLabel,
    },
    {
      icon: MapPinIcon,
      label: "Zone",
      value: shift.zoneName,
    },
    {
      icon: CalendarDaysIcon,
      label: "Location",
      value: shift.locationName,
    },
  ]

  return (
    <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
      {meta.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-border/70 bg-muted/10 px-3 py-2.5"
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <item.icon className="size-3.5" />
            {item.label}
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-foreground">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}

export { ShiftOverviewCards }
