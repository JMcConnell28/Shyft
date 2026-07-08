import {
  CalendarCheckIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
} from "lucide-react"

import type { DashboardShiftSummary } from "@/features/dashboard/types"
import {
  DashboardEmptyState,
  DashboardPanel,
  DashboardPanelHeader,
} from "@/features/dashboard/components/dashboard-desktop-panel"

function NextShiftCard({ shift }: { shift: DashboardShiftSummary | null }) {
  return (
    <DashboardPanel>
      <DashboardPanelHeader
        action={
          shift ? (
            <span className="rounded-[10px] border border-[#dfe5f0] bg-[#fbfcff] px-2.5 py-1 text-[11px] font-semibold text-[#61709a]">
              {shift.dayLabel}
            </span>
          ) : null
        }
        icon={CalendarCheckIcon}
        title="Next shift"
      />
      <div className="p-4">
        {shift ? (
          <div className="space-y-3">
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em] text-[#11245a]">
                {shift.dateLabel}
              </p>
              <p className="mt-0.5 text-sm font-medium text-[#7a86a4]">
                {shift.locationName}
              </p>
            </div>

            <ShiftMetaGrid shift={shift} />
          </div>
        ) : (
          <DashboardEmptyState
            title="No upcoming shift"
            description="Published shifts assigned to you will appear here."
          />
        )}
      </div>
    </DashboardPanel>
  )
}

function ThisWeekShiftsCard({ shifts }: { shifts: DashboardShiftSummary[] }) {
  return (
    <DashboardPanel className="h-fit">
      <DashboardPanelHeader
        action={
          <span className="rounded-[10px] border border-[#dfe5f0] bg-[#fbfcff] px-2.5 py-1 text-[11px] font-semibold text-[#61709a]">
            {shifts.length} shift{shifts.length === 1 ? "" : "s"}
          </span>
        }
        icon={CalendarDaysIcon}
        title="Your shifts this week"
      />
      <div className="p-4">
        {shifts.length === 0 ? (
          <DashboardEmptyState
            title="No shifts this week"
            description="When a published rota includes you, your shifts will appear here."
          />
        ) : (
          <div className="divide-y divide-[#edf0f6] overflow-hidden rounded-[12px] border border-[#dfe5f0] bg-white">
            {shifts.map((shift) => (
              <ShiftListRow key={shift.id} shift={shift} />
            ))}
          </div>
        )}
      </div>
    </DashboardPanel>
  )
}

function ShiftListRow({ shift }: { shift: DashboardShiftSummary }) {
  return (
    <div className="grid gap-3 bg-white px-4 py-3 transition-colors hover:bg-[#fbfcff] sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:items-center">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-[#0069ff]" />
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[#7a86a4] uppercase">
            {shift.dayLabel}
          </p>
          <p className="text-sm font-semibold text-[#11245a]">
            {shift.dateLabel}
          </p>
        </div>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#11245a]">
          {shift.zoneName}
        </p>
        <p className="mt-0.5 truncate text-xs font-medium text-[#7a86a4]">
          {shift.locationName}
        </p>
      </div>

      <div className="flex items-center gap-1.5 rounded-[10px] bg-[#f4f7ff] px-2.5 py-1.5 text-xs font-semibold text-[#33477d] sm:justify-end">
        <ClockIcon className="size-3.5 text-[#7a86a4]" />
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
    <div className="grid gap-2">
      {meta.map((item) => (
        <div
          key={item.label}
          className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-2 rounded-[10px] border border-[#dfe5f0] bg-[#fbfcff] px-3 py-2"
        >
          <item.icon className="size-3.5 text-[#7a86a4]" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#7a86a4]">
              {item.label}
            </p>
            <p className="truncate text-sm font-semibold text-[#11245a]">
              {item.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export { NextShiftCard, ThisWeekShiftsCard }
