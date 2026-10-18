import type { DashboardView } from "@/features/dashboard/schemas/dashboard-search"
import type { OrganizationCapabilities } from "@/lib/auth/workspace-capabilities"

type DashboardCapabilities = Pick<
  OrganizationCapabilities,
  "canManageRota" | "canManageTimeClock"
>

function canViewManagerDashboard(capabilities: DashboardCapabilities): boolean {
  return capabilities.canManageRota || capabilities.canManageTimeClock
}

function getDashboardView(
  capabilities: DashboardCapabilities,
  requestedView?: DashboardView
): DashboardView {
  return canViewManagerDashboard(capabilities) && requestedView !== "personal"
    ? "manager"
    : "personal"
}

export { canViewManagerDashboard, getDashboardView }
