import type { AssignableOrganizationRole } from "@/lib/auth/permissions"
import type {
  CompanyEmployeePayrollUpdate,
  CompanyEmployeeRotaNoteCategory,
  CompanyEmployeeRotaNotePriority,
} from "@/features/company/types"
import type { EmployeeCompensationInput } from "@/features/staff-groups/types"
import { requireCompanyAdminContext } from "@/features/company/server/shared"
import { setEmployeeCompensation } from "@/features/staff-groups/server/actions"
import { syncWorkspaceBillingSubscriptionQuantities } from "@/features/billing/server/subscriptions"
import { getDatabase } from "@/lib/db"

type CompanyActionScope = Awaited<ReturnType<typeof requireCompanyAdminContext>>

type EmployeeAccountRow = {
  email: string | null
  full_name: string
  id: string
  user_id: string | null
}

type EmployeeRotaNoteInput = {
  body: string
  category: CompanyEmployeeRotaNoteCategory
  isPinned: boolean
  locationId: string | null
  priority: CompanyEmployeeRotaNotePriority
  title: string
  zoneId: string | null
}

async function updateCompanyEmployeeRole(input: {
  employeeId: string
  locationId?: string
  organizationId?: string
  role: AssignableOrganizationRole
  userId: string
}) {
  const context = await requireCompanyAdminContext(input)
  const employee = await getEmployeeAccount(context, input.employeeId)

  if (!employee.user_id) {
    throw new Error("This employee does not have an account yet.")
  }

  if (employee.user_id === context.userId) {
    throw new Error("You cannot change your own role.")
  }

  if (context.organizationId) {
    await updateOrganizationRole(context, employee.user_id, input.role)
  } else if (context.locationId) {
    await updateLocationRole(context, employee.user_id, input.role)
  }

  return {
    employeeId: employee.id,
    role: input.role,
  }
}

async function updateCompanyEmployeeLocationActivity(input: {
  employeeId: string
  isActive: boolean
  locationId?: string
  organizationId?: string
  targetLocationId: string
  userId: string
}) {
  const context = await requireCompanyAdminContext(input)
  const employee = await getEmployeeAccount(context, input.employeeId)
  await assertLocationInScope(context, input.targetLocationId)

  await getDatabase().query(
    `insert into public.employee_location_assignments (
       employee_id,
       organization_id,
       location_id,
       is_enabled,
       disabled_at
     ) values ($1, $2, $3, $4, case when $4 then null else timezone('utc', now()) end)
     on conflict (employee_id, location_id)
     do update set is_enabled = excluded.is_enabled,
                   disabled_at = excluded.disabled_at`,
    [
      employee.id,
      context.organizationId,
      input.targetLocationId,
      input.isActive,
    ]
  )
  await syncEmployeeStatus(employee.id)
  await syncBilling(context)

  return {
    employeeId: employee.id,
    isActive: input.isActive,
    locationId: input.targetLocationId,
  }
}

async function updateCompanyEmployeeCompensation(input: {
  compensation: EmployeeCompensationInput
  employeeId: string
  locationId?: string
  organizationId?: string
  userId: string
}) {
  await setEmployeeCompensation(input)

  return {
    employeeId: input.employeeId,
  }
}

async function updateCompanyEmployeePayrollId(input: {
  employeeId: string
  locationId?: string
  organizationId?: string
  payrollId: string | null
  userId: string
}) {
  const [result] = await updateCompanyEmployeePayrollIds({
    ...input,
    updates: [
      {
        employeeId: input.employeeId,
        payrollId: input.payrollId,
      },
    ],
  })

  return result
}

async function createCompanyEmployeeRotaNote(input: {
  employeeId: string
  locationId?: string
  note: EmployeeRotaNoteInput
  organizationId?: string
  userId: string
}) {
  const context = await requireCompanyAdminContext(input)
  const [employee, organizationId, scope] = await Promise.all([
    getEmployeeAccount(context, input.employeeId),
    getRequiredNoteOrganizationId(context),
    normalizeRotaNoteScope(context, input.note),
  ])

  const result = await getDatabase().query<{ id: string }>(
    `insert into public.employee_rota_notes (
       organization_id,
       employee_id,
       location_id,
       zone_id,
       category,
       title,
       body,
       priority,
       is_pinned,
       created_by_user_id
     ) values ($1, $2::uuid, $3::uuid, $4::uuid, $5, $6, $7, $8, $9, $10)
     returning id`,
    [
      organizationId,
      employee.id,
      scope.locationId,
      scope.zoneId,
      input.note.category,
      input.note.title,
      input.note.body,
      input.note.priority,
      input.note.isPinned,
      context.userId,
    ]
  )

  return {
    employeeId: employee.id,
    noteId: result.rows[0]?.id ?? null,
  }
}

async function updateCompanyEmployeeRotaNote(input: {
  employeeId: string
  locationId?: string
  note: EmployeeRotaNoteInput
  noteId: string
  organizationId?: string
  userId: string
}) {
  const context = await requireCompanyAdminContext(input)
  const [employee, scope] = await Promise.all([
    getEmployeeAccount(context, input.employeeId),
    normalizeRotaNoteScope(context, input.note),
  ])
  await assertRotaNoteInScope(context, {
    employeeId: employee.id,
    noteId: input.noteId,
  })

  await getDatabase().query(
    `update public.employee_rota_notes
     set location_id = $3::uuid,
         zone_id = $4::uuid,
         category = $5,
         title = $6,
         body = $7,
         priority = $8,
         is_pinned = $9,
         updated_at = timezone('utc', now())
     where id = $1::uuid
       and employee_id = $2::uuid
       and status = 'active'`,
    [
      input.noteId,
      employee.id,
      scope.locationId,
      scope.zoneId,
      input.note.category,
      input.note.title,
      input.note.body,
      input.note.priority,
      input.note.isPinned,
    ]
  )

  return {
    employeeId: employee.id,
    noteId: input.noteId,
  }
}

async function archiveCompanyEmployeeRotaNote(input: {
  employeeId: string
  locationId?: string
  noteId: string
  organizationId?: string
  userId: string
}) {
  const context = await requireCompanyAdminContext(input)
  const employee = await getEmployeeAccount(context, input.employeeId)
  await assertRotaNoteInScope(context, {
    employeeId: employee.id,
    noteId: input.noteId,
  })

  await getDatabase().query(
    `update public.employee_rota_notes
     set status = 'archived',
         archived_at = timezone('utc', now()),
         updated_at = timezone('utc', now())
     where id = $1::uuid
       and employee_id = $2::uuid
       and status = 'active'`,
    [input.noteId, employee.id]
  )

  return {
    employeeId: employee.id,
    noteId: input.noteId,
  }
}

async function bulkUpdateCompanyEmployeePayrollIds(input: {
  locationId?: string
  organizationId?: string
  updates: CompanyEmployeePayrollUpdate[]
  userId: string
}) {
  return updateCompanyEmployeePayrollIds(input)
}

async function updateCompanyEmployeePayrollIds(input: {
  locationId?: string
  organizationId?: string
  updates: CompanyEmployeePayrollUpdate[]
  userId: string
}) {
  const context = await requireCompanyAdminContext(input)
  const updates = normalizePayrollUpdates(input.updates)

  await assertEmployeesInScope(
    context,
    updates.map((update) => update.employeeId)
  )

  for (const update of updates) {
    await getDatabase().query(
      `update public.employees
       set payroll_id = nullif(trim($2::text), ''),
           updated_at = timezone('utc', now())
       where id = $1::uuid`,
      [update.employeeId, update.payrollId]
    )
  }

  return updates
}

async function getEmployeeAccount(
  context: CompanyActionScope,
  employeeId: string
): Promise<EmployeeAccountRow> {
  const result = await getDatabase().query<EmployeeAccountRow>(
    `select id, full_name, email, user_id
     from public.employees
     where (($1::text is null and organization_id is null) or organization_id = $1::text)
       and (($2::uuid is null and location_id is null) or location_id = $2::uuid)
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
  context: CompanyActionScope,
  employeeIds: string[]
) {
  const result = await getDatabase().query<{ id: string }>(
    `select id
     from public.employees
     where (($1::text is null and organization_id is null) or organization_id = $1::text)
       and (($2::uuid is null and location_id is null) or location_id = $2::uuid)
       and id = any($3::uuid[])`,
    [context.organizationId, context.locationId, employeeIds]
  )
  const foundIds = new Set(result.rows.map((row) => row.id))

  if (employeeIds.some((employeeId) => !foundIds.has(employeeId))) {
    throw new Error("One or more employees could not be found.")
  }
}

async function updateOrganizationRole(
  context: CompanyActionScope,
  targetUserId: string,
  role: AssignableOrganizationRole
) {
  const currentRole = await getOrganizationRole(context, targetUserId)

  if (currentRole === "owner") {
    throw new Error("Workspace owners cannot be changed from here.")
  }

  await assertAnotherAdminRemains({
    currentRole,
    organizationId: context.organizationId,
    targetUserId,
  })
  await getDatabase().query(
    `update public."member"
     set role = $3
     where "organizationId" = $1::text
       and "userId" = $2::text`,
    [context.organizationId, targetUserId, role]
  )
}

async function updateLocationRole(
  context: CompanyActionScope,
  targetUserId: string,
  role: AssignableOrganizationRole
) {
  const currentRole = await getLocationRole(context, targetUserId)

  if (currentRole === "owner") {
    throw new Error("Location owners cannot be changed from here.")
  }

  await assertAnotherAdminRemains({
    currentRole,
    locationId: context.locationId,
    targetUserId,
  })
  await getDatabase().query(
    `update public.location_memberships
     set role = $3,
         updated_at = timezone('utc', now())
     where location_id = $1::uuid
       and user_id = $2::text`,
    [context.locationId, targetUserId, role]
  )
}

async function getOrganizationRole(
  context: CompanyActionScope,
  targetUserId: string
) {
  const result = await getDatabase().query<{ role: string }>(
    `select role
     from public."member"
     where "organizationId" = $1::text
       and "userId" = $2::text
     limit 1`,
    [context.organizationId, targetUserId]
  )
  const role = result.rows.at(0)?.role ?? null

  if (!role) {
    throw new Error("This employee is not a workspace member yet.")
  }

  return normalizePrimaryRole(role)
}

async function getLocationRole(
  context: CompanyActionScope,
  targetUserId: string
) {
  const result = await getDatabase().query<{ role: string }>(
    `select role
     from public.location_memberships
     where location_id = $1::uuid
       and user_id = $2::text
     limit 1`,
    [context.locationId, targetUserId]
  )
  const role = result.rows.at(0)?.role ?? null

  if (!role) {
    throw new Error("This employee is not a location member yet.")
  }

  return normalizePrimaryRole(role)
}

async function assertAnotherAdminRemains(input: {
  currentRole: string | null
  locationId?: string | null
  organizationId?: string | null
  targetUserId: string
}) {
  if (input.currentRole !== "admin") {
    return
  }

  const result = input.organizationId
    ? await getDatabase().query<{ count: string }>(
        `select count(*)::text
         from public."member"
         where "organizationId" = $1::text
           and "userId" <> $2::text
           and exists (
             select 1
             from unnest(string_to_array(role, ',')) role_entry
             where trim(role_entry) in ('owner', 'admin')
           )`,
        [input.organizationId, input.targetUserId]
      )
    : await getDatabase().query<{ count: string }>(
        `select count(*)::text
         from public.location_memberships
         where location_id = $1::uuid
           and user_id <> $2::text
           and role in ('owner', 'admin')`,
        [input.locationId, input.targetUserId]
      )

  if (Number(result.rows.at(0)?.count ?? 0) === 0) {
    throw new Error("At least one other admin or owner must remain.")
  }
}

async function assertLocationInScope(
  context: CompanyActionScope,
  locationId: string
) {
  const result = await getDatabase().query<{ id: string }>(
    `select id
     from public.locations
     where (
         ($1::text is not null and organization_id = $1::text)
         or ($1::text is null and id = $2::uuid)
       )
       and id = $3::uuid
     limit 1`,
    [context.organizationId, context.locationId, locationId]
  )

  if (!result.rows.at(0)) {
    throw new Error("Choose a location in this workspace.")
  }
}

async function getRequiredNoteOrganizationId(context: CompanyActionScope) {
  if (context.organizationId) {
    return context.organizationId
  }

  const result = await getDatabase().query<{ organization_id: string | null }>(
    `select organization_id
     from public.locations
     where id = $1::uuid
     limit 1`,
    [context.locationId]
  )
  const organizationId = result.rows.at(0)?.organization_id ?? null

  if (!organizationId) {
    throw new Error("Rota notes are available for organisation workspaces.")
  }

  return organizationId
}

async function normalizeRotaNoteScope(
  context: CompanyActionScope,
  note: EmployeeRotaNoteInput
) {
  let locationId = note.locationId

  if (locationId) {
    await assertLocationInScope(context, locationId)
  }

  if (!note.zoneId) {
    return { locationId, zoneId: null }
  }

  const result = await getDatabase().query<{ location_id: string }>(
    `select zone.location_id
     from public.zones zone
     join public.locations location on location.id = zone.location_id
     where zone.id = $3::uuid
       and zone.deleted_at is null
       and (
         ($1::text is not null and location.organization_id = $1::text)
         or ($1::text is null and location.id = $2::uuid)
       )
     limit 1`,
    [context.organizationId, context.locationId, note.zoneId]
  )
  const zoneLocationId = result.rows.at(0)?.location_id ?? null

  if (!zoneLocationId) {
    throw new Error("Choose a zone in this workspace.")
  }

  if (locationId && locationId !== zoneLocationId) {
    throw new Error("Choose a zone that belongs to the selected location.")
  }

  locationId = zoneLocationId

  return {
    locationId,
    zoneId: note.zoneId,
  }
}

async function assertRotaNoteInScope(
  context: CompanyActionScope,
  input: { employeeId: string; noteId: string }
) {
  const result = await getDatabase().query<{ id: string }>(
    `select note.id
     from public.employee_rota_notes note
     where note.id = $3::uuid
       and note.employee_id = $4::uuid
       and note.status = 'active'
       and (
         ($1::text is not null and note.organization_id = $1::text)
         or (
           $1::text is null
           and exists (
             select 1
             from public.locations location
             where location.id = $2::uuid
               and location.organization_id = note.organization_id
           )
         )
       )
     limit 1`,
    [context.organizationId, context.locationId, input.noteId, input.employeeId]
  )

  if (!result.rows.at(0)) {
    throw new Error("That note could not be found.")
  }
}

async function syncEmployeeStatus(employeeId: string) {
  await getDatabase().query(
    `update public.employees employee
     set status = case
         when exists (
           select 1
           from public.employee_location_assignments assignment
           where assignment.employee_id = employee.id
             and assignment.is_enabled = true
             and assignment.disabled_at is null
         ) then 'active'
         else 'inactive'
       end,
       updated_at = timezone('utc', now())
     where employee.id = $1::uuid`,
    [employeeId]
  )
}

async function syncBilling(context: CompanyActionScope) {
  try {
    await syncWorkspaceBillingSubscriptionQuantities({
      organizationId: context.organizationId ?? undefined,
      locationId: context.locationId ?? undefined,
      userId: context.userId,
    })
  } catch (error) {
    console.warn(
      "Could not sync billing quantities after company change.",
      error
    )
  }
}

function normalizePrimaryRole(role: string | null) {
  return role?.split(",")[0]?.trim() ?? null
}

function normalizePayrollUpdates(updates: CompanyEmployeePayrollUpdate[]) {
  const employeeIds = new Set<string>()
  const payrollIds = new Set<string>()

  return updates.map((update) => {
    if (employeeIds.has(update.employeeId)) {
      throw new Error("Each employee can only appear once in an import.")
    }
    employeeIds.add(update.employeeId)

    const payrollId = update.payrollId?.trim() || null
    const normalizedPayrollId = payrollId?.toLowerCase() ?? null

    if (normalizedPayrollId && payrollIds.has(normalizedPayrollId)) {
      throw new Error("Each payroll ID can only be assigned once.")
    }

    if (normalizedPayrollId) {
      payrollIds.add(normalizedPayrollId)
    }

    return {
      employeeId: update.employeeId,
      payrollId,
    }
  })
}

export {
  archiveCompanyEmployeeRotaNote,
  bulkUpdateCompanyEmployeePayrollIds,
  createCompanyEmployeeRotaNote,
  updateCompanyEmployeeCompensation,
  updateCompanyEmployeeLocationActivity,
  updateCompanyEmployeePayrollId,
  updateCompanyEmployeeRotaNote,
  updateCompanyEmployeeRole,
}
