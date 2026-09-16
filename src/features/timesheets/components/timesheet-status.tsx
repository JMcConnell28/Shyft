import { AlertCircleIcon, CheckIcon, Clock3Icon } from "lucide-react"

import type {
  TimesheetEntry,
  TimesheetTotals,
} from "@/features/timesheets/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getTimesheetHealth } from "@/features/timesheets/utils/timesheet-view"
import { cn } from "@/lib/utils"

function TimesheetHealthBadge({ timesheet }: { timesheet: TimesheetTotals }) {
  const health = getTimesheetHealth(timesheet)
  const Icon =
    health === "ready"
      ? CheckIcon
      : health === "open"
        ? Clock3Icon
        : AlertCircleIcon
  const label =
    health === "ready"
      ? "Ready"
      : health === "open"
        ? "Open entry"
        : "Needs review"

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold",
        health === "ready" && "bg-emerald-50 text-emerald-700",
        health === "open" && "bg-blue-50 text-[#236cff]",
        health === "attention" && "bg-orange-50 text-orange-700"
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  )
}

function TimesheetEntryBadge({ entry }: { entry: TimesheetEntry | null }) {
  if (!entry) return <StatusBadge label="No entry" tone="muted" />
  if (entry.status === "requires_review") {
    return <StatusBadge label="Review" tone="orange" />
  }
  if (entry.status === "open") return <StatusBadge label="Open" tone="blue" />
  if (entry.status === "scheduled") {
    return <StatusBadge label="Scheduled" tone="muted" />
  }
  return <StatusBadge label="Complete" tone="green" />
}

function StatusBadge({
  label,
  tone,
}: {
  label: string
  tone: "blue" | "green" | "muted" | "orange"
}) {
  const toneClassName = {
    blue: "bg-blue-50 text-[#236cff]",
    green: "bg-emerald-50 text-emerald-700",
    muted: "bg-[#f0f3f8] text-[#68769a]",
    orange: "bg-orange-50 text-orange-700",
  }[tone]

  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold",
        toneClassName
      )}
    >
      {label}
    </span>
  )
}

function TimesheetEmployeeAvatar({ name }: { name: string }) {
  return (
    <Avatar className="bg-[#eaf0ff] after:border-[#d9e2f7]">
      <AvatarFallback className="bg-[#eaf0ff] text-[11px] font-bold text-[#315fb5]">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase() ?? "")
    .join("")
}

export { TimesheetEmployeeAvatar, TimesheetEntryBadge, TimesheetHealthBadge }
