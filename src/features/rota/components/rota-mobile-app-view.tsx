"use client"

import {
  BellIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ChevronRightIcon,
  Clock3Icon,
  HomeIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  RocketIcon,
  UserRoundIcon,
} from "lucide-react"

import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import {
  getShiftDisplayLines,
  getShiftDurationMinutes,
} from "@/features/rota/utils/workspace-shifts"
import type { WorkspaceDay, WorkspaceShift } from "@/features/rota/types/workspace"
import { cn } from "@/lib/utils"

type MobileShift = {
  id: string
  day: WorkspaceDay
  shift: WorkspaceShift
  timeLabel: string
  zoneLabel: string
  assignedNames: Array<string>
}

function RotaMobileAppView() {
  const {
    assignmentIdsByShiftId,
    assignmentsById,
    days,
    getEmployee,
    meta,
    selectedLocation,
    shiftIdsByDayId,
    shiftsById,
    zones,
  } = useRotaWorkspace()
  const shifts = days.flatMap((day) =>
    (shiftIdsByDayId[day.id] ?? [])
      .map((shiftId): MobileShift | null => {
        const shift = shiftsById[shiftId]

        if (!shift) {
          return null
        }

        const assignedNames = (assignmentIdsByShiftId[shift.id] ?? [])
          .map((assignmentId) => {
            const assignment = assignmentsById[assignmentId]
            return assignment ? getEmployee(assignment.employeeId)?.name : null
          })
          .filter((name): name is string => Boolean(name))

        return {
          id: shift.id,
          day,
          shift,
          timeLabel: getShiftDisplayLines(shift).join(" / "),
          zoneLabel:
            zones.find((zone) => zone.id === shift.zoneId)?.name ??
            shift.zoneName ??
            "Shift",
          assignedNames,
        }
      })
      .filter((shift): shift is MobileShift => Boolean(shift))
  )
  const nextShift = shifts[0] ?? null
  const totalMinutes = shifts.reduce(
    (sum, entry) => sum + getShiftDurationMinutes(entry.shift, selectedLocation),
    0
  )
  const hoursLabel = formatMinutes(totalMinutes)

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f7f9ff] text-[#080d23] md:hidden">
      <div className="mx-auto flex min-h-full max-w-md flex-col px-5 pt-5 pb-24">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
              <RocketIcon className="size-5" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">RocketRota</p>
              <p className="text-xs font-medium text-slate-500">
                {selectedLocation.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative grid size-10 place-items-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200"
            >
              <BellIcon className="size-5" />
              {meta.hasUnpublishedChanges ? (
                <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  1
                </span>
              ) : null}
            </button>
            <div className="grid size-12 place-items-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
              RR
            </div>
          </div>
        </header>

        <section className="relative mt-9 overflow-hidden pb-4">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight">
              This week's rota
            </h1>
            <p className="mt-2 text-base font-medium text-slate-500">
              You have{" "}
              <span className="font-bold text-blue-600">
                {shifts.length} {shifts.length === 1 ? "shift" : "shifts"}
              </span>{" "}
              scheduled.
            </p>
          </div>
          <div className="absolute right-2 bottom-0 h-24 w-32 opacity-95">
            <div className="absolute right-4 bottom-2 h-16 w-16 rotate-45 rounded-[1.75rem] bg-blue-600 shadow-xl shadow-blue-500/25" />
            <div className="absolute right-10 bottom-8 grid size-12 place-items-center rounded-full bg-white text-blue-600 shadow-lg">
              <RocketIcon className="size-7 rotate-45" />
            </div>
            <div className="absolute right-0 bottom-0 h-8 w-28 rounded-full bg-violet-100" />
          </div>
        </section>

        <NextShiftCard shift={nextShift} />

        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-start justify-between px-5 py-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Shifts this week
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {shifts.length} {shifts.length === 1 ? "shift" : "shifts"} ·{" "}
                {hoursLabel}
              </p>
            </div>
            <span className="text-sm font-bold text-blue-600">View all</span>
          </div>

          {shifts.length === 0 ? (
            <div className="border-t border-slate-100 px-5 py-10 text-center text-sm font-medium text-slate-500">
              No shifts are scheduled for this week.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border-t border-slate-100">
              {shifts.slice(0, 5).map((shift, index) => (
                <MobileShiftRow
                  key={shift.id}
                  shift={shift}
                  highlighted={index === 0}
                />
              ))}
            </div>
          )}
        </section>

        {meta.note?.trim() ? (
          <section className="mt-5 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                <MoreHorizontalIcon className="size-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-violet-700">
                  Team note
                </h2>
                <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm font-medium text-slate-500">
                  {meta.note}
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <MobileBottomNav />
    </div>
  )
}

function NextShiftCard({ shift }: { shift: MobileShift | null }) {
  if (!shift) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-blue-600">Next shift</h2>
        <p className="mt-4 text-sm font-medium text-slate-500">
          No shifts are scheduled for this week.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/60">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-blue-600">Next shift</h2>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
          <Clock3Icon className="size-4" />
          Upcoming
        </span>
      </div>

      <div className="mt-5 flex gap-4">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25">
          <CalendarDaysIcon className="size-8" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-500">
            {shift.day.shortLabel} · {shift.day.dayNumber} {shift.day.monthLabel}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight">
            {shift.timeLabel}
          </p>
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
            <MapPinIcon className="size-4" />
            {shift.zoneLabel}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
            <UserRoundIcon className="size-4" />
            {formatAssignedNames(shift.assignedNames)}
          </p>
        </div>
      </div>
    </section>
  )
}

function MobileShiftRow({
  highlighted,
  shift,
}: {
  highlighted: boolean
  shift: MobileShift
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[4.5rem_0.75rem_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3",
        highlighted ? "bg-blue-50/60" : "bg-white"
      )}
    >
      <div>
        <p
          className={cn(
            "text-base font-bold",
            highlighted ? "text-blue-600" : "text-slate-950"
          )}
        >
          {highlighted ? "Today" : shift.day.shortLabel}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-500">
          {shift.day.dayNumber} {shift.day.monthLabel}
        </p>
      </div>
      <span
        className={cn(
          "size-2.5 rounded-full",
          highlighted ? "bg-blue-600" : "bg-slate-300"
        )}
      />
      <div className="min-w-0">
        <p className="truncate text-base font-bold tracking-tight">
          {shift.timeLabel}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-500">
          {shift.zoneLabel}
        </p>
        <p className="truncate text-sm font-semibold text-slate-500">
          {formatAssignedNames(shift.assignedNames)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
          Upcoming
        </span>
        <ChevronRightIcon className="size-5 text-slate-400" />
      </div>
    </div>
  )
}

function MobileBottomNav() {
  const items = [
    { label: "Dashboard", icon: HomeIcon, active: true },
    { label: "My Shifts", icon: CalendarDaysIcon, active: false },
    { label: "Calendar", icon: CalendarIcon, active: false },
    { label: "More", icon: MoreHorizontalIcon, active: false },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md rounded-t-3xl border border-slate-200/80 bg-white/95 px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className={cn(
              "flex flex-col items-center gap-1 text-xs font-bold",
              item.active ? "text-blue-600" : "text-slate-500"
            )}
          >
            <item.icon className="size-6" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

function formatAssignedNames(names: Array<string>) {
  if (names.length === 0) {
    return "Unassigned"
  }

  if (names.length <= 2) {
    return names.join(", ")
  }

  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`
}

function formatMinutes(minutes: number) {
  const hours = minutes / 60

  return `${new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: hours % 1 === 0 ? 0 : 1,
  }).format(hours)}h`
}

export default RotaMobileAppView
