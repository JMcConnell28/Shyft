import { Link } from "@tanstack/react-router"
import {
  ArrowRightIcon,
  CalendarClockIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
} from "lucide-react"

import { DashboardCard } from "./dashboard-card"
import { DashboardEmptyState } from "./dashboard-empty-state"
import type { DashboardMobileContext } from "./dashboard-mobile-types"
import type { DashboardShiftSummary } from "@/features/dashboard/types"
import { Badge } from "@/components/panelui/badge"
import { buttonVariants } from "@/components/ui/button"
import { getRotaViewPath } from "@/features/dashboard/utils/shift-display"
import { cn } from "@/lib/utils"

function NextShiftCard({
  shift,
  context,
}: {
  shift: DashboardShiftSummary | null
  context: Pick<DashboardMobileContext, "workspaceSlug" | "workspaceType">
}) {
  return (
    <DashboardCard title="Next shift" headingId="personal-next-shift">
      {shift ? (
        <Link
          to={getRotaViewPath({ shift, ...context })}
          className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <span className="min-w-0 space-y-0.5">
            <span className="block text-sm font-semibold">
              {shift.dayLabel}, {shift.dateLabel}
            </span>
            <span className="block text-sm tabular-nums">
              {shift.timeLabel}
            </span>
            <span className="block text-xs wrap-anywhere text-muted-foreground">
              {shift.locationName} · {shift.zoneName}
            </span>
          </span>
          <span className="sr-only">View shift</span>
          <ChevronRightIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </Link>
      ) : (
        <DashboardEmptyState
          icon={CalendarClockIcon}
          title="No upcoming shift"
          description="Your next published shift will appear here."
        />
      )}
    </DashboardCard>
  )
}

function ThisWeekShiftsCard({
  shifts,
  rotasHref,
}: {
  shifts: Array<DashboardShiftSummary>
  rotasHref?: string
}) {
  return (
    <DashboardCard
      title="Your shifts this week"
      headingId="personal-week-shifts"
      action={
        shifts.length > 0 ? (
          <Badge variant="secondary" size="sm">
            {shifts.length} {shifts.length === 1 ? "shift" : "shifts"}
          </Badge>
        ) : null
      }
    >
      {shifts.length > 0 ? (
        <ul className="divide-y divide-border/60">
          {shifts.map((shift) => (
            <ShiftListRow key={shift.id} shift={shift} />
          ))}
        </ul>
      ) : (
        <DashboardEmptyState
          variant="featured"
          icon={CalendarDaysIcon}
          title="No shifts this week"
          description="Any shifts assigned to you will appear once the rota is published."
          action={
            rotasHref ? (
              <Link
                to={rotasHref}
                className={cn(buttonVariants({ variant: "secondary" }))}
              >
                View rotas
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            ) : null
          }
        />
      )}
    </DashboardCard>
  )
}

function ShiftListRow({ shift }: { shift: DashboardShiftSummary }) {
  return (
    <li className="grid grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 px-4 py-2.5">
      <div>
        <p className="text-xs text-muted-foreground">{shift.dayLabel}</p>
        <p className="text-sm font-semibold">{shift.dateLabel}</p>
      </div>
      <div className="min-w-0 wrap-anywhere">
        <p className="text-sm font-semibold">{shift.zoneName}</p>
        <p className="text-xs text-muted-foreground">{shift.locationName}</p>
      </div>
      <div className="min-w-0 text-right">
        <p className="text-sm font-medium tabular-nums">{shift.timeLabel}</p>
        {shift.durationLabel ? (
          <p className="text-xs text-muted-foreground">{shift.durationLabel}</p>
        ) : null}
      </div>
    </li>
  )
}

export { NextShiftCard, ThisWeekShiftsCard }
