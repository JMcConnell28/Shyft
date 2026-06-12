import type { DashboardShiftSummary } from "@/features/dashboard/types"

function formatShiftCount(count: number) {
  return `${count} shift${count === 1 ? "" : "s"}`
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

function getUserInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  return initials || "RR"
}

export {
  formatShiftCount,
  getDashboardGreeting,
  getRotaViewPath,
  getUserInitials,
}
