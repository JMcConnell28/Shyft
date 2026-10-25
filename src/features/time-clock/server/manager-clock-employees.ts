import "@tanstack/react-start/server-only"

import { z } from "zod"
import { getDatabase } from "@/lib/db"

const clockEmployeeSchema = z.object({
  id: z.string().uuid(),
  location_id: z.string().uuid(),
  full_name: z.string(),
  email: z.string().nullable(),
  status: z.string(),
})
type AssignedClockEmployee = z.infer<typeof clockEmployeeSchema>

const assignedClockEmployeesSql = `
  select employee.id, assignment.location_id,
         employee.full_name, employee.email, employee.status
  from public.employee_location_assignments assignment
  join public.employees employee on employee.id = assignment.employee_id
  where assignment.location_id = any($1::uuid[])
    and assignment.is_enabled = true
    and assignment.disabled_at is null
  order by employee.full_name, assignment.location_id`

// Call only after requireClockManagerScope and listManagedClockLocations.
async function listAssignedClockEmployees(
  locationIds: Array<string>
): Promise<Array<AssignedClockEmployee>> {
  if (!locationIds.length) return []
  const result = await getDatabase().query<AssignedClockEmployee>(
    assignedClockEmployeesSql,
    [locationIds]
  )
  return z.array(clockEmployeeSchema).parse(result.rows)
}

export { assignedClockEmployeesSql, listAssignedClockEmployees }
