import "@tanstack/react-start/server-only"

import type { PoolClient } from "pg"
import type { LockedJoinRequest } from "@/features/join-approvals/server/types"
import { createEmployeeMemberId } from "@/features/onboarding/utils/invite-utils"
import { isEmployeeOnlyRole } from "@/features/onboarding/utils/employee-role"
import { getMinimumWagePenceForDateOfBirth } from "@/features/staff-groups/utils/minimum-wage"

async function provisionApprovedEmployee(
  client: PoolClient,
  request: LockedJoinRequest
): Promise<void> {
  if (!request.location_id || !request.staff_group_id) {
    throw new Error(
      "This location or staff group was removed. Deny the request and share a new link."
    )
  }

  const location = await client.query(
    `select id from public.locations where id = $1 and organization_id = $2`,
    [request.location_id, request.organization_id]
  )
  const group = await client.query(
    `select id from public.staff_groups where id = $1 and organization_id = $2`,
    [request.staff_group_id, request.organization_id]
  )
  if (!location.rows[0] || !group.rows[0]) {
    throw new Error("This location or staff group is no longer available.")
  }

  await client.query(
    `select pg_advisory_xact_lock(hashtext($1), hashtext($2))`,
    [request.organization_id, request.user_id]
  )
  const membership = await client.query<{ role: string }>(
    `select role from public."member" where "organizationId" = $1 and "userId" = $2`,
    [request.organization_id, request.user_id]
  )
  if (membership.rows.some((row) => !isEmployeeOnlyRole(row.role))) {
    throw new Error("This person already has a different organization role.")
  }
  if (!membership.rows[0]) {
    await client.query(
      `insert into public."member" (id, "organizationId", "userId", role, "createdAt")
       values ($1, $2, $3, 'employee', now())`,
      [createEmployeeMemberId(), request.organization_id, request.user_id]
    )
  }

  const employee = await client.query<{ id: string }>(
    `insert into public.employees
       (organization_id, user_id, staff_group_id, full_name, email, status)
     values ($1, $2, $3, $4, $5, 'active')
     on conflict (organization_id, user_id) where user_id is not null
     do update set staff_group_id = excluded.staff_group_id,
                   full_name = excluded.full_name, email = excluded.email,
                   status = 'active', updated_at = now()
     returning id`,
    [
      request.organization_id,
      request.user_id,
      request.staff_group_id,
      request.name,
      request.email,
    ]
  )
  const employeeId = employee.rows[0].id
  await client.query(
    `insert into public.employee_compensation
       (employee_id, organization_id, location_id, pay_type, hourly_rate_pence)
     values ($1, $2, null, 'hourly', $3)
     on conflict (employee_id) do nothing`,
    [
      employeeId,
      request.organization_id,
      getMinimumWagePenceForDateOfBirth(request.dateOfBirth),
    ]
  )
  await client.query(
    `insert into public.employee_location_assignments
       (organization_id, employee_id, location_id, staff_group_id, is_enabled, disabled_at)
     values ($1, $2, $3, $4, true, null)
     on conflict (employee_id, location_id)
     do update set staff_group_id = excluded.staff_group_id,
                   is_enabled = true, disabled_at = null`,
    [
      request.organization_id,
      employeeId,
      request.location_id,
      request.staff_group_id,
    ]
  )
}

export { provisionApprovedEmployee }
