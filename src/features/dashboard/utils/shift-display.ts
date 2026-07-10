import type { DashboardShiftSummary } from "@/features/dashboard/types"

type ShiftDateParts = {
  day: string
  dayNumber: string
  month: string
}

function getDashboardGreeting(date = new Date()) {
  const hour = date.getHours()

  if (hour < 12) {
    return "Good morning"
  }

  if (hour < 18) {
    return "Good afternoon"
  }

  return "Good evening"
}

function getRotaViewPath(input: {
  shift: DashboardShiftSummary
  workspaceSlug: string
  workspaceType: "location" | "organization"
}) {
  if (input.workspaceType === "location") {
    return `/w/${input.workspaceSlug}/rota/${input.shift.rotaId}/view`
  }

  return `/w/${input.workspaceSlug}/rota/${input.shift.locationSlug}/${input.shift.rotaId}/view`
}

function getShiftDateParts(dateValue: string): ShiftDateParts {
  const date = new Date(`${dateValue}T00:00:00`)

  return {
    day: new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date),
    dayNumber: new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(
      date
    ),
    month: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date),
  }
}

export { getDashboardGreeting, getRotaViewPath, getShiftDateParts }
export type { ShiftDateParts }
