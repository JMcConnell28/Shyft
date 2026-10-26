import "@tanstack/react-start/server-only"

import type { CompanyScope } from "@/features/company/server/shared"
import { getDatabase } from "@/lib/db"

type EmployeeAccountRow = {
  email: string | null
  full_name: string
  id: string
  offboarded_at: string | null
  user_id: string | null
}

// Organization employees can retain a primary location. Standalone access must
// still match both the absence of an organization and the selected location.
const employeeScopeCondition = `(
  ($1::text is not null and organization_id = $1::text)
  or ($1::text is null and organization_id is null and location_id = $2::uuid)
)`

async function getEmployeeAccount(
  context: CompanyScope,
  employeeId: string
): Promise<EmployeeAccountRow> {
  const result = await getDatabase().query<EmployeeAccountRow>(
    `select id, full_name, email, user_id, offboarded_at
     from public.employees
     where ${employeeScopeCondition}
       and id = $3::uuid
     limit 1`,
    [context.organizationId, context.locationId, employeeId]
  )
  const employee = result.rows.at(0)

  if (!employee) {
    throw new Error("That employee could not be found.")
  }

  return employee
}

async function assertEmployeesInScope(
  context: CompanyScope,
  employeeIds: Array<string>
): Promise<void> {
  const result = await getDatabase().query<{ id: string }>(
    `select id
     from public.employees
     where ${employeeScopeCondition}
       and id = any($3::uuid[])`,
    [context.organizationId, context.locationId, employeeIds]
  )
  const foundIds = new Set(result.rows.map((row) => row.id))

  if (employeeIds.some((employeeId) => !foundIds.has(employeeId))) {
    throw new Error("One or more employees could not be found.")
  }
}

export { assertEmployeesInScope, getEmployeeAccount }
