import type { PoolClient } from "pg"

import { getDatabase } from "@/lib/db"

import { withDatabaseTransaction } from "@/features/staff-groups/server/shared"

type EmployeeLifecycleScope = {
  locationId: string | null
  organizationId: string | null
  userId: string
}

type WorkspaceEmployeeRecord = {
  id: string
  userId: string | null
}

async function removeEmployeeFromScope(input: {
  employeeId: string
  scope: EmployeeLifecycleScope
}) {
  const employee = await getWorkspaceEmployee(input.scope, input.employeeId)

  if (employee.userId === input.scope.userId) {
    throw new Error("You cannot remove your own team member record.")
  }

  await assertEmployeeCanBeRemoved(input.scope, employee)

  await withDatabaseTransaction(async (client) => {
    await client.query(
      `update public.employees
       set status = 'inactive',
           offboarded_at = case
             when $1::text is not null then timezone('utc', now())
             else offboarded_at
           end,
           updated_at = timezone('utc', now())
       where (($1::text is null and organization_id is null) or organization_id = $1::text)
         and (($2::uuid is null and location_id is null) or location_id = $2::uuid)
         and id = $3::uuid`,
      [input.scope.organizationId, input.scope.locationId, employee.id]
    )

    if (input.scope.locationId) {
      await client.query(
        `update public.employee_location_assignments
         set is_enabled = false,
             disabled_at = timezone('utc', now())
         where location_id = $1::uuid
           and employee_id = $2::uuid`,
        [input.scope.locationId, employee.id]
      )

      if (employee.userId) {
        await client.query(
          `delete from public.location_memberships
           where location_id = $1::uuid
             and user_id = $2::text`,
          [input.scope.locationId, employee.userId]
        )
      }

      return
    }

    if (!input.scope.organizationId) {
      return
    }

    await markFutureDraftRotasChanged({
      client,
      employeeId: employee.id,
      organizationId: input.scope.organizationId,
    })
    await removeFutureRotaAssignments({
      client,
      employeeId: employee.id,
      organizationId: input.scope.organizationId,
    })
    await client.query(
      `update public.employee_location_assignments
       set is_enabled = false,
           disabled_at = timezone('utc', now())
       where organization_id = $1::text
         and employee_id = $2::uuid`,
      [input.scope.organizationId, employee.id]
    )

    if (employee.userId) {
      await client.query(
        `delete from public.location_memberships membership
         using public.locations location
         where membership.location_id = location.id
           and location.organization_id = $1::text
           and membership.user_id = $2::text`,
        [input.scope.organizationId, employee.userId]
      )
      await client.query(
        `delete from public."member"
         where "organizationId" = $1::text
           and "userId" = $2::text`,
        [input.scope.organizationId, employee.userId]
      )
    }
  })

  return { employeeId: employee.id }
}

async function getWorkspaceEmployee(
  scope: EmployeeLifecycleScope,
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

  return { id: employee.id, userId: employee.user_id }
}

async function assertEmployeeCanBeRemoved(
  scope: EmployeeLifecycleScope,
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

  const organizationRole = await getOrganizationRole({
    organizationId: scope.organizationId,
    userId: employee.userId,
  })

  if (organizationRole.includes("owner")) {
    throw new Error("You cannot remove an organisation owner.")
  }

  const locationOwnerResult = await getDatabase().query<{ id: string }>(
    `select membership.id
     from public.location_memberships membership
     join public.locations location on location.id = membership.location_id
     where location.organization_id = $1::text
       and membership.user_id = $2::text
       and membership.role = 'owner'
     limit 1`,
    [scope.organizationId, employee.userId]
  )

  if (locationOwnerResult.rows[0]) {
    throw new Error("Transfer this employee's location ownership before removing them.")
  }

  if (!organizationRole.includes("admin")) {
    return
  }

  const result = await getDatabase().query<{ count: string }>(
    `select count(*)::text
     from public."member"
     where "organizationId" = $1::text
       and "userId" <> $2::text
       and exists (
         select 1
         from unnest(string_to_array(role, ',')) role_entry
         where trim(role_entry) in ('owner', 'admin')
       )`,
    [scope.organizationId, employee.userId]
  )

  if (Number(result.rows.at(0)?.count ?? 0) === 0) {
    throw new Error("At least one other admin or owner must remain.")
  }
}

async function getOrganizationRole(input: { organizationId: string; userId: string }) {
  const result = await getDatabase().query<{ role: string }>(
    `select role
     from public."member"
     where "organizationId" = $1::text
       and "userId" = $2::text
     limit 1`,
    [input.organizationId, input.userId]
  )

  return result.rows.at(0)?.role.split(",").map((role) => role.trim()) ?? []
}

async function markFutureDraftRotasChanged(input: {
  client: PoolClient
  employeeId: string
  organizationId: string
}) {
  await input.client.query(
    `update public.rotas rota
     set has_unpublished_changes = true,
         updated_at = timezone('utc', now())
     where rota.organization_id = $1::text
       and exists (
         select 1
         from public.rota_shift_assignments assignment
         join public.rota_shifts shift on shift.id = assignment.rota_shift_id
         where assignment.employee_id = $2::uuid
           and shift.rota_id = rota.id
           and shift.organization_id = $1::text
           and shift.day_date + shift.start_time > (
             now() at time zone coalesce(
               (
                 select settings.timezone
                 from public.location_clock_settings settings
                 where settings.location_id = rota.location_id
               ),
               'Europe/London'
             )
           )
       )`,
    [input.organizationId, input.employeeId]
  )
}

async function removeFutureRotaAssignments(input: {
  client: PoolClient
  employeeId: string
  organizationId: string
}) {
  const futureShiftPredicate = `
    shift.day_date + shift.start_time > (
      now() at time zone coalesce(
        (
          select settings.timezone
          from public.location_clock_settings settings
          where settings.location_id = rota.location_id
        ),
        'Europe/London'
      )
    )`

  await input.client.query(
    `delete from public.rota_shift_assignments assignment
     using public.rota_shifts shift,
           public.rotas rota
     where assignment.rota_shift_id = shift.id
       and shift.rota_id = rota.id
       and assignment.employee_id = $2::uuid
       and shift.organization_id = $1::text
       and ${futureShiftPredicate}`,
    [input.organizationId, input.employeeId]
  )
  await input.client.query(
    `delete from public.rota_published_shift_assignments assignment
     using public.rota_published_shifts shift,
           public.rotas rota
     where assignment.rota_published_shift_id = shift.id
       and shift.rota_id = rota.id
       and assignment.employee_id = $2::uuid
       and shift.organization_id = $1::text
       and ${futureShiftPredicate}`,
    [input.organizationId, input.employeeId]
  )
}

export { removeEmployeeFromScope }
