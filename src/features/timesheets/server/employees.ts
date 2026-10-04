import type { TimesheetEmployeeRow } from "@/features/timesheets/server/row-types"
import { getDatabase } from "@/lib/db"

async function listUserEmployees(input: {
  locationIds: Array<string>
  organizationId: string | null
  userId: string
}): Promise<Array<TimesheetEmployeeRow>> {
  const result = await getDatabase().query<TimesheetEmployeeRow>(
    `select distinct
       employee.id as employee_id,
       employee.full_name as employee_name,
       employee.payroll_id as employee_payroll_id,
       location.name as location_name
     from public.employees employee
     join public.employee_location_assignments assignment
       on assignment.employee_id = employee.id
     join public.locations location on location.id = assignment.location_id
     where employee.user_id = $1
       and employee.status = 'active'
       and assignment.location_id = any($2::uuid[])
       and assignment.is_enabled = true
       and assignment.disabled_at is null
       and (
         ($3::text is not null and employee.organization_id = $3::text)
         or ($3::text is null)
       )
     order by employee.full_name asc`,
    [input.userId, input.locationIds, input.organizationId]
  )

  return result.rows
}

async function listTimesheetEmployees(
  locationIds: Array<string>
): Promise<Array<TimesheetEmployeeRow>> {
  const result = await getDatabase().query<TimesheetEmployeeRow>(
    `select distinct
       employee.id as employee_id,
       employee.full_name as employee_name,
       employee.payroll_id as employee_payroll_id,
       location.name as location_name
     from public.employee_location_assignments assignment
     join public.employees employee on employee.id = assignment.employee_id
     join public.locations location on location.id = assignment.location_id
     where assignment.location_id = any($1::uuid[])
       and employee.status = 'active'
       and assignment.is_enabled = true
       and assignment.disabled_at is null
     order by employee.full_name asc`,
    [locationIds]
  )

  return result.rows
}

export { listUserEmployees, listTimesheetEmployees }
