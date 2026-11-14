import type { OrganizationCapabilities } from "@/lib/auth/workspace-capabilities"

type DashboardCapabilities = Pick<
  OrganizationCapabilities,
  "canManageRota" | "canManageTimeClock"
>

function canViewManagerDashboard(capabilities: DashboardCapabilities): boolean {
  return capabilities.canManageRota || capabilities.canManageTimeClock
}

export { canViewManagerDashboard }
