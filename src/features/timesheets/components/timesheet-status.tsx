import { AlertCircleIcon, CheckIcon, Clock3Icon } from "lucide-react"

import type {
  TimesheetEntry,
  TimesheetTotals,
} from "@/features/timesheets/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getTimesheetHealth } from "@/features/timesheets/utils/timesheet-view"
import { Badge } from "@/components/panelui/badge"

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
    <Badge
      size="sm"
      variant={
        health === "ready" ? "success" : health === "open" ? "info" : "warning"
      }
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </Badge>
  )
}

function TimesheetEntryBadge({ entry }: { entry: TimesheetEntry | null }) {
  if (!entry)
    return (
      <Badge size="sm" variant="secondary">
        No entry
      </Badge>
    )
  if (entry.status === "requires_review") {
    return (
      <Badge size="sm" variant="warning">
        Review
      </Badge>
    )
  }
  if (entry.status === "open")
    return (
      <Badge size="sm" variant="info">
        Open
      </Badge>
    )
  if (entry.status === "scheduled") {
    return (
      <Badge size="sm" variant="secondary">
        Scheduled
      </Badge>
    )
  }
  return (
    <Badge size="sm" variant="success">
      Complete
    </Badge>
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
