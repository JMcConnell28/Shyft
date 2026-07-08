import type { EmployeeCompensationInput } from "@/features/staff-groups/types"
import { getDatabase } from "@/lib/db"

import { syncWorkspaceBillingSubscriptionQuantities } from "@/features/billing/server/subscriptions"
import {
  assertGroupNameAvailable,
  createUniqueStaffGroupSlug,
  ensureEmployeeBelongsToWorkspace,
  ensureEmployeesBelongToWorkspace,
  getEmployeeFallbackStaffGroup,
  getStaffGroupOrThrow,
  isEmployeeStaffGroup,
  listStaffGroupsWithCounts,
  requireManagedStaffGroupsContext,
  withDatabaseTransaction,
} from "@/features/staff-groups/server/shared"

type StaffGroupScope = Pick<
  Awaited<ReturnType<typeof requireManagedStaffGroupsContext>>,
  "locationId" | "organizationId"
>

type WorkspaceEmployeeRecord = {
  id: string
  userId: string | null
}

async function getWorkspaceEmployee(
  scope: StaffGroupScope,
  employeeId: string
): Promise<WorkspaceEmployeeRecord> {
  const result = await getDatabase().query<{
    id: string
    user_id: string | null
  }>(
    `select id, user_id
     from public.employees
     where (($1::text is null and organization_id is null) or organization_id = $1::text)
       and (($2::uuid is null and location_id is null) or location_id = $2::uuid)
       and id = $3::uuid
     limit 1`,
    [scope.organizationId, scope.locationId, employeeId]
  )

  const employee = result.rows.at(0)

  if (!employee) {
    throw new Error("That team member could not be found.")
  }

  return {
    id: employee.id,
    userId: employee.user_id,
  }
}

async function assertEmployeeCanBeRemoved(
  scope: StaffGroupScope,
  employee: WorkspaceEmployeeRecord
) {
  if (!employee.userId) {
    return
  }

  if (scope.locationId) {
    const result = await getDatabase().query<{ role: string }>(
      `select role
       from public.location_memberships
       where location_id = $1::uuid
         and user_id = $2::text
       limit 1`,
      [scope.locationId, employee.userId]
    )

    if (result.rows[0]?.role === "owner") {
      throw new Error("You cannot remove a location owner.")
    }

    return
  }

  if (!scope.organizationId) {
    return
  }

  const result = await getDatabase().query<{ role: string }>(
    `select role
     from public."member"
     where "organizationId" = $1::text
       and "userId" = $2::text
     limit 1`,
    [scope.organizationId, employee.userId]
  )

  const roles = result.rows[0]?.role.split(",").map((role) => role.trim()) ?? []

  if (roles.includes("owner")) {
    throw new Error("You cannot remove an organisation owner.")
  }
}

async function createStaffGroup(input: {
  organizationId?: string
  locationId?: string
  userId: string
  name: string
  color: string
}) {
  const context = await requireManagedStaffGroupsContext(input)
  const name = input.name.trim()
  await assertGroupNameAvailable({
    scope: context,
    name,
  })
  const slug = await createUniqueStaffGroupSlug(context, name)
  const result = await getDatabase().query<{ id: string }>(
    `insert into public.staff_groups (
       organization_id,
       location_id,
       name,
       slug,
       color
     ) values ($1, $2, $3, $4, $5)
     returning id`,
    [context.organizationId, context.locationId, name, slug, input.color]
  )

  return {
    groupId: result.rows[0]?.id ?? "",
  }
}

async function renameStaffGroup(input: {
  organizationId?: string
  locationId?: string
  userId: string
  groupId: string
  name: string
}) {
  const context = await requireManagedStaffGroupsContext(input)
  const group = await getStaffGroupOrThrow(context, input.groupId)

  if (isEmployeeStaffGroup(group)) {
    throw new Error("The Employee group name is fixed and cannot be changed.")
  }

  const name = input.name.trim()

  await assertGroupNameAvailable({
    scope: context,
    name,
    excludeGroupId: group.id,
  })

  const slug = await createUniqueStaffGroupSlug(context, name, group.id)
  await getDatabase().query(
    `update public.staff_groups
     set name = $3,
         slug = $4,
         updated_at = timezone('utc', now())
     where (($1::text is null and organization_id is null) or organization_id = $1::text)
       and (($2::uuid is null and location_id is null) or location_id = $2::uuid)
       and id = $5::uuid`,
    [context.organizationId, context.locationId, name, slug, group.id]
  )

  return {
    groupId: group.id,
  }
}

async function setStaffGroupColor(input: {
  organizationId?: string
  locationId?: string
  userId: string
  groupId: string
  color: string
}) {
  const context = await requireManagedStaffGroupsContext(input)
  const group = await getStaffGroupOrThrow(context, input.groupId)
  await getDatabase().query(
    `update public.staff_groups
     set color = $3,
         updated_at = timezone('utc', now())
     where (($1::text is null and organization_id is null) or organization_id = $1::text)
       and (($2::uuid is null and location_id is null) or location_id = $2::uuid)
       and id = $4::uuid`,
    [context.organizationId, context.locationId, input.color, group.id]
  )

  return {
    groupId: group.id,
    color: input.color,
  }
}

async function deleteStaffGroup(input: {
  organizationId?: string
  locationId?: string
  userId: string
  groupId: string
}) {
  const context = await requireManagedStaffGroupsContext(input)
  const groups = await listStaffGroupsWithCounts(context)
  const group = groups.find((entry) => entry.id === input.groupId) ?? null

  if (!group) {
    throw new Error("That staff group could not be found.")
  }

  if (group.isFallback) {
    throw new Error("The Employee group is protected and cannot be deleted.")
  }

  const fallbackGroup = getEmployeeFallbackStaffGroup(groups)

  if (!fallbackGroup) {
    throw new Error("We could not find the Employee fallback group.")
  }

  await withDatabaseTransaction(async (client) => {
    if (group.employeeCount > 0) {
      await client.query(
        `update public.employees
         set staff_group_id = $1,
             updated_at = timezone('utc', now())
         where (($2::text is null and organization_id is null) or organization_id = $2::text)
           and (($3::uuid is null and location_id is null) or location_id = $3::uuid)
           and staff_group_id = $4::uuid`,
        [fallbackGroup.id, context.organizationId, context.locationId, group.id]
      )
    }

    await client.query(
      `delete from public.staff_groups
       where (($1::text is null and organization_id is null) or organization_id = $1::text)
         and (($2::uuid is null and location_id is null) or location_id = $2::uuid)
         and id = $3::uuid`,
      [context.organizationId, context.locationId, group.id]
    )
  })

  return {
    groupId: group.id,
  }
}

async function assignEmployeeStaffGroup(input: {
  organizationId?: string
  locationId?: string
  userId: string
  employeeId: string
  groupId: string
}) {
  const context = await requireManagedStaffGroupsContext(input)
  await Promise.all([
    ensureEmployeeBelongsToWorkspace(context, input.employeeId),
    getStaffGroupOrThrow(context, input.groupId),
  ])

  await getDatabase().query(
    `update public.employees
     set staff_group_id = $3,
         updated_at = timezone('utc', now())
     where (($1::text is null and organization_id is null) or organization_id = $1::text)
       and (($2::uuid is null and location_id is null) or location_id = $2::uuid)
       and id = $4::uuid`,
    [
      context.organizationId,
      context.locationId,
      input.groupId,
      input.employeeId,
    ]
  )

  return {
    employeeId: input.employeeId,
    groupId: input.groupId,
  }
}

async function bulkAssignEmployeeStaffGroup(input: {
  organizationId?: string
  locationId?: string
  userId: string
  employeeIds: Array<string>
  groupId: string
}) {
  const context = await requireManagedStaffGroupsContext(input)
  await Promise.all([
    ensureEmployeesBelongToWorkspace(context, input.employeeIds),
    getStaffGroupOrThrow(context, input.groupId),
  ])

  await withDatabaseTransaction(async (client) => {
    await client.query(
      `update public.employees
       set staff_group_id = $1,
           updated_at = timezone('utc', now())
       where (($2::text is null and organization_id is null) or organization_id = $2::text)
         and (($3::uuid is null and location_id is null) or location_id = $3::uuid)
         and id = any($4::uuid[])`,
      [
        input.groupId,
        context.organizationId,
        context.locationId,
        input.employeeIds,
      ]
    )
  })

  return {
    employeeIds: input.employeeIds,
    groupId: input.groupId,
  }
}

async function setEmployeeActiveStatus(input: {
  organizationId?: string
  locationId?: string
  userId: string
  employeeId: string
  isActive: boolean
}) {
  const context = await requireManagedStaffGroupsContext(input)
  await ensureEmployeeBelongsToWorkspace(context, input.employeeId)

  const status = input.isActive ? "active" : "inactive"

  await getDatabase().query(
    `update public.employees
     set status = $3,
         updated_at = timezone('utc', now())
     where (($1::text is null and organization_id is null) or organization_id = $1::text)
       and (($2::uuid is null and location_id is null) or location_id = $2::uuid)
       and id = $4::uuid`,
    [context.organizationId, context.locationId, status, input.employeeId]
  )
  await syncBillingQuantitiesForStaffContext(context)

  return {
    employeeId: input.employeeId,
    status,
  }
}

async function setEmployeeCompensation(input: {
  organizationId?: string
  locationId?: string
  userId: string
  employeeId: string
  compensation: EmployeeCompensationInput
}) {
  const context = await requireManagedStaffGroupsContext(input)
  await ensureEmployeeBelongsToWorkspace(context, input.employeeId)
  await updateEmployeeCompensation({
    context,
    employeeIds: [input.employeeId],
    compensation: input.compensation,
  })

  return { employeeIds: [input.employeeId] }
}

async function bulkSetEmployeeCompensation(input: {
  organizationId?: string
  locationId?: string
  userId: string
  employeeIds: Array<string>
  compensation: EmployeeCompensationInput
}) {
  const context = await requireManagedStaffGroupsContext(input)
  await ensureEmployeesBelongToWorkspace(context, input.employeeIds)
  await updateEmployeeCompensation({
    context,
    employeeIds: input.employeeIds,
    compensation: input.compensation,
  })

  return { employeeIds: input.employeeIds }
}

async function updateEmployeeCompensation(input: {
  context: StaffGroupScope
  employeeIds: Array<string>
  compensation: EmployeeCompensationInput
}) {
  const hourlyRatePence =
    input.compensation.type === "hourly"
      ? input.compensation.hourlyRatePence
      : null
  const weeklySalaryPence =
    input.compensation.type === "salary"
      ? input.compensation.weeklySalaryPence
      : null

  await getDatabase().query(
    `insert into public.employee_compensation (
       employee_id,
       organization_id,
       location_id,
       pay_type,
       hourly_rate_pence,
       weekly_salary_pence
     )
     select employee.id, $4::text, $5::uuid, $1, $2, $3
     from public.employees employee
     where (($4::text is null and employee.organization_id is null) or employee.organization_id = $4::text)
       and (($5::uuid is null and employee.location_id is null) or employee.location_id = $5::uuid)
       and employee.id = any($6::uuid[])
     on conflict (employee_id)
     do update set pay_type = excluded.pay_type,
         hourly_rate_pence = $2,
         weekly_salary_pence = $3,
         updated_at = timezone('utc', now())
    `,
    [
      input.compensation.type,
      hourlyRatePence,
      weeklySalaryPence,
      input.context.organizationId,
      input.context.locationId,
      input.employeeIds,
    ]
  )
}

async function removeEmployeeFromWorkspace(input: {
  organizationId?: string
  locationId?: string
  userId: string
  employeeId: string
}) {
  const context = await requireManagedStaffGroupsContext(input)
  const employee = await getWorkspaceEmployee(context, input.employeeId)

  if (employee.userId === context.userId) {
    throw new Error("You cannot remove your own team member record.")
  }

  await assertEmployeeCanBeRemoved(context, employee)

  await withDatabaseTransaction(async (client) => {
    await client.query(
      `update public.employees
       set status = 'inactive',
           updated_at = timezone('utc', now())
       where (($1::text is null and organization_id is null) or organization_id = $1::text)
         and (($2::uuid is null and location_id is null) or location_id = $2::uuid)
         and id = $3::uuid`,
      [context.organizationId, context.locationId, employee.id]
    )

    if (context.locationId) {
      await client.query(
        `update public.employee_location_assignments
         set is_enabled = false,
             disabled_at = timezone('utc', now())
         where location_id = $1::uuid
           and employee_id = $2::uuid`,
        [context.locationId, employee.id]
      )

      if (employee.userId) {
        await client.query(
          `delete from public.location_memberships
           where location_id = $1::uuid
             and user_id = $2::text`,
          [context.locationId, employee.userId]
        )
      }

      return
    }

    if (!context.organizationId) {
      return
    }

    await client.query(
      `update public.employee_location_assignments
       set is_enabled = false,
           disabled_at = timezone('utc', now())
       where organization_id = $1::text
         and employee_id = $2::uuid`,
      [context.organizationId, employee.id]
    )

    if (employee.userId) {
      await client.query(
        `delete from public."member"
         where "organizationId" = $1::text
           and "userId" = $2::text`,
        [context.organizationId, employee.userId]
      )
    }
  })
  await syncBillingQuantitiesForStaffContext(context)

  return {
    employeeId: employee.id,
  }
}

async function syncBillingQuantitiesForStaffContext(
  context: StaffGroupScope & { userId: string }
) {
  try {
    await syncWorkspaceBillingSubscriptionQuantities({
      organizationId: context.organizationId ?? undefined,
      locationId: context.locationId ?? undefined,
      userId: context.userId,
    })
  } catch (error) {
    console.warn("Could not sync billing quantities after staff change.", error)
  }
}

export {
  assignEmployeeStaffGroup,
  bulkSetEmployeeCompensation,
  bulkAssignEmployeeStaffGroup,
  createStaffGroup,
  deleteStaffGroup,
  renameStaffGroup,
  removeEmployeeFromWorkspace,
  setEmployeeActiveStatus,
  setEmployeeCompensation,
  setStaffGroupColor,
}
