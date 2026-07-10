import type { PoolClient } from "pg"

import { requireLocationPermission } from "@/lib/auth/has-location-permission"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { getDatabase } from "@/lib/db"
import { slugify } from "@/lib/slug"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import {
  normalizeStaffGroupColor,
} from "@/features/staff-groups/constants/staff-group-colors"
import {
  assertSupabaseSuccess,
  getRequiredSupabaseRow,
} from "@/lib/supabase-errors"

import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import type { StaffGroupSettingsGroup } from "@/features/staff-groups/types"

const EMPLOYEE_STAFF_GROUP_NAME = "Employee"
const EMPLOYEE_STAFF_GROUP_SLUG = "employee"
const LEGACY_EMPLOYEE_STAFF_GROUP_SLUG = "employees"
const EMPLOYEE_STAFF_GROUP_COLOR = "emerald"

type StaffGroupScope = {
  organizationId: string | null
  locationId: string | null
}

type ManagedStaffGroupsContext = StaffGroupScope & {
  userId: string
}

async function requireManagedStaffGroupsContext(input: {
  organizationId?: string
  locationId?: string
  userId: string
}): Promise<ManagedStaffGroupsContext> {
  const { session } = await requireVerifiedSessionOrThrow()

  if (session.user.id !== input.userId) {
    throw new Error("Your workspace session is no longer valid. Refresh and try again.")
  }

  if (input.organizationId) {
    if (session.session.activeOrganizationId !== input.organizationId) {
      throw new Error("Your workspace session is no longer valid. Refresh and try again.")
    }

    await requireOrgPermission({
      organizationId: input.organizationId,
      userId: session.user.id,
      permissions: {
        member: ["create"],
      },
      errorMessage: "You do not have permission to manage staff groups.",
    })

    const context = {
      organizationId: input.organizationId,
      locationId: null,
      userId: session.user.id,
    }

    await ensureEmployeeStaffGroup(context)
    return context
  }

  if (!input.locationId) {
    throw new Error("Choose a location.")
  }

  await requireLocationPermission({
    locationId: input.locationId,
    userId: session.user.id,
    permissions: {
      location: ["update"],
    },
    errorMessage: "You do not have permission to manage staff groups.",
  })

  const context = {
    organizationId: null,
    locationId: input.locationId,
    userId: session.user.id,
  }

  await ensureEmployeeStaffGroup(context)
  return context
}

async function listStaffGroupsWithCounts(scope: StaffGroupScope) {
  const supabase = createSupabaseServerClient()
  const groupsQuery = supabase
    .from("staff_groups")
    .select("id, name, slug, is_default, color")
    .order("name", { ascending: true })
  const employeesQuery = supabase
    .from("employees")
    .select("staff_group_id")
  const [groupsResult, employeesResult] = await Promise.all([
    scope.organizationId
      ? groupsQuery.eq("organization_id", scope.organizationId)
      : groupsQuery.is("organization_id", null).eq("location_id", scope.locationId ?? ""),
    scope.organizationId
      ? employeesQuery.eq("organization_id", scope.organizationId)
      : employeesQuery.is("organization_id", null).eq("location_id", scope.locationId ?? ""),
  ])

  assertSupabaseSuccess(groupsResult.error, "We could not load the staff groups.")
  assertSupabaseSuccess(
    employeesResult.error,
    "We could not load the team member groups.",
  )

  const countsByGroupId = (employeesResult.data ?? []).reduce(
    (counts, employee) => {
      if (!employee.staff_group_id) {
        return counts
      }

      counts.set(
        employee.staff_group_id,
        (counts.get(employee.staff_group_id) ?? 0) + 1,
      )
      return counts
    },
    new Map<string, number>(),
  )

  return (groupsResult.data ?? [])
    .map((group) => ({
      id: group.id,
      name: group.name,
      slug: group.slug,
      isFallback: isEmployeeStaffGroup(group),
      employeeCount: countsByGroupId.get(group.id) ?? 0,
      color: normalizeStaffGroupColor(group.color),
    }))
    .sort((left, right) => {
      if (left.isFallback === right.isFallback) {
        return left.name.localeCompare(right.name)
      }

      return left.isFallback ? -1 : 1
    }) satisfies Array<StaffGroupSettingsGroup>
}

function getEmployeeFallbackStaffGroup(
  groups: Array<StaffGroupSettingsGroup>,
) {
  return groups.find((group) => group.isFallback) ?? null
}

function isEmployeeStaffGroup(group: {
  slug: string
  is_default?: boolean | null
}) {
  return (
    group.slug === EMPLOYEE_STAFF_GROUP_SLUG ||
    group.slug === LEGACY_EMPLOYEE_STAFF_GROUP_SLUG ||
    Boolean(group.is_default)
  )
}

async function getStaffGroupOrThrow(
  scope: StaffGroupScope,
  groupId: string,
) {
  const supabase = createSupabaseServerClient()
  const query = supabase
    .from("staff_groups")
    .select("id, name, slug, is_default, color")
    .eq("id", groupId)
  const result = await (scope.organizationId
    ? query.eq("organization_id", scope.organizationId)
    : query.is("organization_id", null).eq("location_id", scope.locationId ?? "")
  ).maybeSingle()

  assertSupabaseSuccess(result.error, "We could not load that staff group.")

  return getRequiredSupabaseRow(
    result.data,
    "That staff group could not be found.",
  )
}

async function ensureEmployeeStaffGroup(scope: StaffGroupScope) {
  const supabase = createSupabaseServerClient()
  const groupsQuery = supabase
    .from("staff_groups")
    .select("id, name, slug, is_default, color")
    .order("created_at", { ascending: true })
  const groupsResult = await (scope.organizationId
    ? groupsQuery.eq("organization_id", scope.organizationId)
    : groupsQuery.is("organization_id", null).eq("location_id", scope.locationId ?? "")
  )

  assertSupabaseSuccess(
    groupsResult.error,
    "We could not verify the Employee staff group.",
  )

  const groups = groupsResult.data ?? []
  const employeeGroup =
    groups.find((group) => group.slug === EMPLOYEE_STAFF_GROUP_SLUG) ??
    groups.find((group) => group.slug === LEGACY_EMPLOYEE_STAFF_GROUP_SLUG) ??
    groups.find((group) => group.is_default) ??
    null

  if (!employeeGroup) {
    await upsertEmployeeStaffGroup(scope)

    return
  }

  const normalizedColor = EMPLOYEE_STAFF_GROUP_COLOR
  const updates: Record<string, string | boolean> = {}

  if (employeeGroup.name !== EMPLOYEE_STAFF_GROUP_NAME) {
    updates.name = EMPLOYEE_STAFF_GROUP_NAME
  }

  if (
    employeeGroup.slug !== EMPLOYEE_STAFF_GROUP_SLUG &&
    !groups.some(
      (group) =>
        group.id !== employeeGroup.id && group.slug === EMPLOYEE_STAFF_GROUP_SLUG,
    )
  ) {
    updates.slug = EMPLOYEE_STAFF_GROUP_SLUG
  }

  if (!employeeGroup.is_default) {
    updates.is_default = true
  }

  if (employeeGroup.color !== normalizedColor) {
    updates.color = normalizedColor
  }

  if (Object.keys(updates).length > 0) {
    const updateQuery = supabase
      .from("staff_groups")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", employeeGroup.id)
    const updateResult = await (scope.organizationId
      ? updateQuery.eq("organization_id", scope.organizationId)
      : updateQuery.is("organization_id", null).eq("location_id", scope.locationId ?? "")
    )

    assertSupabaseSuccess(
      updateResult.error,
      "We could not update the Employee staff group.",
    )
  }

  const resetDefaultsQuery = supabase
    .from("staff_groups")
    .update({
      is_default: false,
      updated_at: new Date().toISOString(),
    })
    .neq("id", employeeGroup.id)
    .eq("is_default", true)
  const resetDefaultsResult = await (scope.organizationId
    ? resetDefaultsQuery.eq("organization_id", scope.organizationId)
    : resetDefaultsQuery.is("organization_id", null).eq("location_id", scope.locationId ?? "")
  )

  assertSupabaseSuccess(
    resetDefaultsResult.error,
    "We could not normalize the Employee staff group.",
  )
}

async function upsertEmployeeStaffGroup(scope: StaffGroupScope) {
  const values = [
    scope.organizationId,
    scope.locationId,
    EMPLOYEE_STAFF_GROUP_NAME,
    EMPLOYEE_STAFF_GROUP_SLUG,
    EMPLOYEE_STAFF_GROUP_COLOR,
  ]

  if (scope.organizationId) {
    await getDatabase().query(
      `insert into public.staff_groups (
         organization_id,
         location_id,
         name,
         slug,
         is_default,
         color
       ) values ($1, $2, $3, $4, true, $5)
       on conflict (organization_id, slug) do update
       set name = excluded.name,
           is_default = true,
           color = excluded.color,
           updated_at = timezone('utc', now())`,
      values,
    )

    return
  }

  await getDatabase().query(
    `insert into public.staff_groups (
       organization_id,
       location_id,
       name,
       slug,
       is_default,
       color
     ) values ($1, $2, $3, $4, true, $5)
     on conflict (location_id, slug) where location_id is not null do update
     set name = excluded.name,
         is_default = true,
         color = excluded.color,
         updated_at = timezone('utc', now())`,
    values,
  )
}

async function ensureEmployeeBelongsToWorkspace(
  scope: StaffGroupScope,
  employeeId: string,
) {
  const supabase = createSupabaseServerClient()
  const query = supabase
    .from("employees")
    .select("id")
    .eq("id", employeeId)
  const result = await (scope.organizationId
    ? query.eq("organization_id", scope.organizationId)
    : query.is("organization_id", null).eq("location_id", scope.locationId ?? "")
  ).maybeSingle()

  assertSupabaseSuccess(result.error, "We could not verify that team member.")

  if (!result.data) {
    throw new Error("That team member could not be found.")
  }
}

async function ensureEmployeesBelongToWorkspace(
  scope: StaffGroupScope,
  employeeIds: string[],
) {
  const supabase = createSupabaseServerClient()
  const query = supabase
    .from("employees")
    .select("id")
    .in("id", employeeIds)
  const result = await (scope.organizationId
    ? query.eq("organization_id", scope.organizationId)
    : query.is("organization_id", null).eq("location_id", scope.locationId ?? "")
  )

  assertSupabaseSuccess(result.error, "We could not verify those team members.")

  const validIds = new Set((result.data ?? []).map((employee) => employee.id))

  if (employeeIds.some((employeeId) => !validIds.has(employeeId))) {
    throw new Error("One or more team members could not be found.")
  }
}

async function createUniqueStaffGroupSlug(
  scope: StaffGroupScope,
  name: string,
  excludeGroupId?: string,
) {
  const supabase = createSupabaseServerClient()
  const baseSlug = slugify(name) || "group"
  let nextSlug = baseSlug
  let counter = 2

  for (;;) {
    let query = supabase
      .from("staff_groups")
      .select("id")
      .eq("slug", nextSlug)
    query = scope.organizationId
      ? query.eq("organization_id", scope.organizationId)
      : query.is("organization_id", null).eq("location_id", scope.locationId ?? "")

    if (excludeGroupId) {
      query = query.neq("id", excludeGroupId)
    }

    const result = await query.maybeSingle()

    assertSupabaseSuccess(
      result.error,
      "We could not check that group name right now.",
    )

    if (!result.data) {
      return nextSlug
    }

    nextSlug = `${baseSlug}-${counter}`
    counter += 1
  }
}

async function assertGroupNameAvailable(input: {
  scope: StaffGroupScope
  name: string
  excludeGroupId?: string
}) {
  const normalizedName = input.name.trim().toLowerCase()
  const supabase = createSupabaseServerClient()
  const query = supabase
    .from("staff_groups")
    .select("id, name")
  const result = await (input.scope.organizationId
    ? query.eq("organization_id", input.scope.organizationId)
    : query.is("organization_id", null).eq("location_id", input.scope.locationId ?? "")
  )

  assertSupabaseSuccess(
    result.error,
    "We could not check that group name right now.",
  )

  const conflictingGroup = (result.data ?? []).find((group) => {
    if (input.excludeGroupId && group.id === input.excludeGroupId) {
      return false
    }

    return group.name.trim().toLowerCase() === normalizedName
  })

  if (conflictingGroup) {
    throw new Error("A staff group with that name already exists.")
  }
}

async function withDatabaseTransaction<T>(
  run: (client: PoolClient) => Promise<T>,
) {
  const client = await getDatabase().connect()

  try {
    await client.query("BEGIN")
    const result = await run(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

export {
  EMPLOYEE_STAFF_GROUP_COLOR,
  EMPLOYEE_STAFF_GROUP_NAME,
  assertGroupNameAvailable,
  createUniqueStaffGroupSlug,
  ensureEmployeeBelongsToWorkspace,
  ensureEmployeeStaffGroup,
  ensureEmployeesBelongToWorkspace,
  getEmployeeFallbackStaffGroup,
  getStaffGroupOrThrow,
  isEmployeeStaffGroup,
  listStaffGroupsWithCounts,
  requireManagedStaffGroupsContext,
  withDatabaseTransaction,
}
export type { StaffGroupScope }
