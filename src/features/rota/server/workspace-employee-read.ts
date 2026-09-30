import { getDatabase } from "@/lib/db"

type WorkspaceEmployeeRow = {
  id: string
  full_name: string
  staff_group_id: string | null
}

async function listWorkspaceEmployees({
  organizationId,
  locationId,
  includeHiddenEmployees,
}: {
  organizationId: string
  locationId: string
  includeHiddenEmployees: boolean
}): Promise<Array<WorkspaceEmployeeRow>> {
  const result = await getDatabase().query<WorkspaceEmployeeRow>(
    `select employee.id,
            employee.full_name,
            coalesce(assignment.staff_group_id, employee.staff_group_id)
              as staff_group_id
     from public.employee_location_assignments assignment
     join public.employees employee
       on employee.id = assignment.employee_id
     where assignment.organization_id = $1
       and assignment.location_id = $2::uuid
       and assignment.is_enabled = true
       and assignment.disabled_at is null
       and ($3::boolean or assignment.show_on_rota = true)
       and employee.organization_id = $1
       and employee.status = 'active'
     order by employee.full_name, employee.id`,
    [organizationId, locationId, includeHiddenEmployees]
  )

  return result.rows.sort((left, right) =>
    left.full_name.localeCompare(right.full_name)
  )
}

export { listWorkspaceEmployees }
