import { getDatabase } from "@/lib/db"

import {
  listStaffGroupsWithCounts,
  requireManagedStaffGroupsContext,
} from "@/features/staff-groups/server/shared"
import type { StaffGroupSettingsPageData } from "@/features/staff-groups/types"

type StaffGroupSettingsEmployeeRow = {
  id: string
  full_name: string
  email: string | null
  status: string
  staff_group_id: string | null
}

async function listWorkspaceEmployees(input: {
  organizationId: string | null
  locationId: string | null
}) {
  if (input.organizationId) {
    const result = await getDatabase().query<StaffGroupSettingsEmployeeRow>(
      `select id, full_name, email, status, staff_group_id
       from public.employees
       where organization_id = $1::text
       order by full_name asc`,
      [input.organizationId],
    )

    return result.rows
  }

  const result = await getDatabase().query<StaffGroupSettingsEmployeeRow>(
    `select employee.id,
            employee.full_name,
            employee.email,
            employee.status,
            employee.staff_group_id
     from public.employee_location_assignments assignment
     join public.employees employee on employee.id = assignment.employee_id
     where assignment.location_id = $1::uuid
       and assignment.is_enabled = true
       and assignment.disabled_at is null
       and assignment.organization_id is null
       and employee.organization_id is null
       and employee.location_id = $1::uuid
     order by employee.full_name asc`,
    [input.locationId],
  )

  return result.rows
}

async function getStaffGroupSettingsPageData(input: {
  organizationId?: string
  locationId?: string
  userId: string
}): Promise<StaffGroupSettingsPageData> {
  const context = await requireManagedStaffGroupsContext(input)
  const [groups, employees] = await Promise.all([
    listStaffGroupsWithCounts(context),
    listWorkspaceEmployees(context),
  ])

  return {
    groups,
    employees: employees.map((employee) => ({
      id: employee.id,
      name: employee.full_name,
      email: employee.email,
      status: employee.status === "inactive" ? "inactive" : "active",
      groupId: employee.staff_group_id,
    })),
  }
}

export { getStaffGroupSettingsPageData }
