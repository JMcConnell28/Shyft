import "@tanstack/react-start/server-only"

import type { CompanyScope } from "@/features/company/server/shared"
import { getLocationFeatureFlags } from "@/features/feature-flags/server/evaluation"
import { getDatabase } from "@/lib/db"

async function canImportSageEmployees(scope: CompanyScope): Promise<boolean> {
  if (scope.locationId) {
    const flags = await getLocationFeatureFlags(scope.locationId)
    return flags["company.sage_employee_import"].enabled
  }
  if (!scope.organizationId) return false

  // Company-wide payroll references cannot be isolated to one location, so a
  // disabled location must not be bypassed through the organization screen.
  const { rows } = await getDatabase().query<{ id: string }>(
    "select id from public.locations where organization_id = $1",
    [scope.organizationId]
  )
  if (rows.length === 0) return false
  const decisions = await Promise.all(
    rows.map(async (location) => {
      const flags = await getLocationFeatureFlags(location.id)
      return flags["company.sage_employee_import"].enabled
    })
  )
  return decisions.every(Boolean)
}

async function requireSageEmployeeImportAccess(
  scope: CompanyScope
): Promise<void> {
  if (!(await canImportSageEmployees(scope))) {
    throw new Error(
      "Sage employee imports are currently unavailable for this workspace."
    )
  }
}
export { canImportSageEmployees, requireSageEmployeeImportAccess }
