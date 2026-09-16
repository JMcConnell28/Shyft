import type { StaffGroupSettingsPageData } from "@/features/staff-groups/types"

import {
  listStaffGroupsWithCounts,
  requireManagedStaffGroupsContext,
} from "@/features/staff-groups/server/shared"
import { getMinimumWagePenceForDateOfBirth } from "@/features/staff-groups/utils/minimum-wage"
import { getDatabase } from "@/lib/db"

type StaffGroupSettingsEmployeeRow = {
  dateOfBirth: string | null
  email: string | null
  full_name: string
  hourly_rate_pence: number | null
  id: string
  pay_type: string | null
  role: string | null
  staff_group_id: string | null
  status: string
  weekly_salary_pence: number | null
}

type StaffGroupSettingsLocationRow = {
  id: string
  name: string
}

async function listTeamLocations(input: {
  organizationId: string | null
  locationId: string | null
}) {
  const result = await getDatabase().query<StaffGroupSettingsLocationRow>(
    input.organizationId
      ? `select id, name
         from public.locations
         where organization_id = $1::text
         order by created_at asc, name asc`
      : `select id, name
         from public.locations
         where organization_id is null
           and id = $1::uuid
         order by created_at asc, name asc`,
    [input.organizationId ?? input.locationId]
  )

  return result.rows
}

async function listLocationEmployees(input: {
  organizationId: string | null
  locationId: string
}) {
  const result = await getDatabase().query<StaffGroupSettingsEmployeeRow>(
    input.organizationId
      ? `select employee.id,
                employee.full_name,
                employee.email,
                employee.status,
                assignment.staff_group_id,
                compensation.pay_type,
                compensation.hourly_rate_pence,
                compensation.weekly_salary_pence,
                account_user."dateOfBirth",
                member.role
         from public.employee_location_assignments assignment
         join public.employees employee on employee.id = assignment.employee_id
         left join public.employee_compensation compensation
           on compensation.employee_id = employee.id
         left join public."user" account_user on account_user.id = employee.user_id
         left join public."member" member
           on member."organizationId" = employee.organization_id
          and member."userId" = employee.user_id
         where assignment.location_id = $1::uuid
           and assignment.organization_id = $2::text
           and assignment.is_enabled = true
           and assignment.disabled_at is null
           and employee.organization_id = $2::text
           and employee.offboarded_at is null
         order by employee.full_name asc`
      : `select employee.id,
                employee.full_name,
                employee.email,
                employee.status,
                assignment.staff_group_id,
                compensation.pay_type,
                compensation.hourly_rate_pence,
                compensation.weekly_salary_pence,
                account_user."dateOfBirth",
                membership.role
         from public.employee_location_assignments assignment
         join public.employees employee on employee.id = assignment.employee_id
         left join public.employee_compensation compensation
           on compensation.employee_id = employee.id
         left join public."user" account_user on account_user.id = employee.user_id
         left join public.location_memberships membership
           on membership.location_id = assignment.location_id
          and membership.user_id = employee.user_id
         where assignment.location_id = $1::uuid
           and assignment.organization_id is null
           and assignment.is_enabled = true
           and assignment.disabled_at is null
           and employee.organization_id is null
           and employee.location_id = $1::uuid
           and employee.offboarded_at is null
         order by employee.full_name asc`,
    [input.locationId, input.organizationId]
  )

  return result.rows
}

async function getStaffGroupSettingsPageData(input: {
  organizationId?: string
  locationId?: string
  selectedLocationId?: string
  userId: string
}): Promise<StaffGroupSettingsPageData> {
  const context = await requireManagedStaffGroupsContext(input)
  const locations = await listTeamLocations(context)
  const selectedLocation = input.selectedLocationId
    ? locations.find((location) => location.id === input.selectedLocationId)
    : locations.at(0)

  if (input.selectedLocationId && !selectedLocation) {
    throw new Error("That location is not available in this workspace.")
  }

  const [groups, employees] = selectedLocation
    ? await Promise.all([
        listStaffGroupsWithCounts(context, selectedLocation.id),
        listLocationEmployees({
          organizationId: context.organizationId,
          locationId: selectedLocation.id,
        }),
      ])
    : [await listStaffGroupsWithCounts(context), []]

  return {
    groups,
    locations,
    selectedLocationId: selectedLocation?.id ?? null,
    employees: employees.map((employee) => ({
      id: employee.id,
      name: employee.full_name,
      email: employee.email,
      role: employee.role,
      status: employee.status === "inactive" ? "inactive" : "active",
      groupId: employee.staff_group_id,
      compensation:
        employee.pay_type === "salary"
          ? {
              type: "salary" as const,
              weeklySalaryPence: employee.weekly_salary_pence ?? 0,
            }
          : {
              type: "hourly" as const,
              hourlyRatePence:
                employee.hourly_rate_pence ??
                getMinimumWagePenceForDateOfBirth(employee.dateOfBirth),
            },
    })),
  }
}

export { getStaffGroupSettingsPageData }
