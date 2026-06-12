import type { WorkspaceBoardData } from "@/features/rota/types/workspace"
import { normalizeStaffGroupColor } from "@/features/staff-groups/constants/staff-group-colors"
import { getOrgCapabilitiesForRole } from "@/lib/auth/get-org-capabilities"
import { getLocationRole } from "@/lib/auth/has-location-permission"
import { getDatabase } from "@/lib/db"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

import { listAccessibleLocations } from "@/features/rota/server/access"
import { getMembershipRole } from "@/features/rota/server/membership"
import { requireVerifiedSessionOrThrow } from "@/features/rota/server/request-session"
import {
  buildWorkspaceDays,
  buildWorkspaceLocation,
  mapShiftRowToWorkspaceShift,
} from "@/features/rota/server/workspace-shared"
import { getTemplatesForLocation } from "@/features/rota/server/lookups"
import { buildWeekLabel } from "@/features/rota/utils/week-utils"

async function getRotaWorkspaceData({
  organizationId,
  locationId,
  userId,
  locationSlug,
  rotaId,
  publishedOnly,
}: {
  organizationId?: string
  locationId?: string
  userId: string
  orgSlug?: string
  locationSlug: string
  rotaId: string
  publishedOnly: boolean
}): Promise<WorkspaceBoardData> {
  const { session } = await requireVerifiedSessionOrThrow()

  if (
    session.user.id !== userId ||
    (organizationId && session.session.activeOrganizationId !== organizationId)
  ) {
    throw new Error(
      "Your workspace session is no longer valid. Refresh and try again."
    )
  }

  const workspaceOrganizationId = organizationId ?? null
  const role = workspaceOrganizationId
    ? await getMembershipRole(workspaceOrganizationId, userId)
    : locationId
      ? await getLocationRole(locationId, userId)
      : null
  const capabilities = getOrgCapabilitiesForRole(role)

  if (!capabilities.canViewRota) {
    throw new Error("You do not have permission to view rotas.")
  }

  if (!publishedOnly && !capabilities.canManageRota) {
    throw new Error("You do not have permission to edit this rota.")
  }

  const locations = await listAccessibleLocations(
    workspaceOrganizationId,
    userId,
    role
  )
  const selectedLocation =
    locations.find((location) => location.slug === locationSlug) ?? null

  if (!selectedLocation) {
    throw new Error("You do not have access to that location.")
  }

  const supabase = createSupabaseServerClient()
  const rotaQuery = supabase
    .from("rotas")
    .select(
      "id, status, note, week_start, published_version, published_snapshot_version, has_unpublished_changes"
    )
    .eq("location_id", selectedLocation.id)
    .eq("id", rotaId)
  const rotaResult = await (
    workspaceOrganizationId
      ? rotaQuery.eq("organization_id", workspaceOrganizationId)
      : rotaQuery.is("organization_id", null)
  ).maybeSingle()

  assertSupabaseSuccess(rotaResult.error, "We could not load that rota.")
  const rota = rotaResult.data

  if (!rota) {
    throw new Error("That rota could not be found.")
  }

  if (
    publishedOnly &&
    (rota.status !== "published" || rota.published_snapshot_version < 1)
  ) {
    throw new Error("This rota has not been published yet.")
  }

  const days = buildWorkspaceDays(rota.week_start)
  const database = getDatabase()
  const [
    hoursResult,
    zonesResult,
    assignmentResult,
    employeesResult,
    groupsResult,
    templates,
  ] = await Promise.all([
    database.query<{
      close_time: string
      close_time_next_day: boolean
      weekday: number
    }>(
      `select weekday, close_time, close_time_next_day
         from public.location_operating_hours
         where location_id = $1`,
      [selectedLocation.id]
    ),
    supabase
      .from("zones")
      .select("id, name, sort_order")
      .eq("location_id", selectedLocation.id)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("employee_location_assignments")
      .select("employee_id")
      .eq("location_id", selectedLocation.id)
      .eq("is_enabled", true)
      .is("disabled_at", null),
    supabase
      .from("employees")
      .select("id, full_name, staff_group_id")
      .eq("status", "active"),
    supabase
      .from("staff_groups")
      .select("id, name, color")
      .order("name", { ascending: true }),
    getTemplatesForLocation(workspaceOrganizationId, selectedLocation.id),
  ])

  assertSupabaseSuccess(zonesResult.error, "We could not load the rota zones.")
  assertSupabaseSuccess(
    assignmentResult.error,
    "We could not load the location staff assignments."
  )
  assertSupabaseSuccess(employeesResult.error, "We could not load employees.")
  assertSupabaseSuccess(groupsResult.error, "We could not load staff groups.")
  const estimatedClosingSettings = await getLocationEstimatedClosingTime(
    selectedLocation.id
  )

  const location = buildWorkspaceLocation(
    {
      ...selectedLocation,
      estimatedClosingTime: estimatedClosingSettings.estimatedClosingTime,
      estimatedClosingTimeNextDay:
        estimatedClosingSettings.estimatedClosingTimeNextDay,
    },
    days,
    hoursResult.rows
  )
  const enabledEmployeeIds = new Set(
    (assignmentResult.data ?? []).map((entry) => entry.employee_id)
  )
  const employees = (employeesResult.data ?? [])
    .filter((employee) => enabledEmployeeIds.has(employee.id))
    .sort((left, right) => left.full_name.localeCompare(right.full_name))
  const employeeGroupIds = new Set(
    employees
      .map((employee) => employee.staff_group_id)
      .filter((value): value is string => Boolean(value))
  )
  const employeeGroups = (groupsResult.data ?? [])
    .filter((group) => employeeGroupIds.has(group.id))
    .map((group) => ({
      id: group.id,
      name: group.name,
      color: normalizeStaffGroupColor(group.color),
    }))

  if (employees.some((employee) => !employee.staff_group_id)) {
    employeeGroups.push({
      id: "ungrouped",
      name: "Team members",
      color: "slate",
    })
  }

  const groupColorById = new Map(
    employeeGroups.map((group) => [group.id, group.color])
  )

  const shiftsResult = publishedOnly
    ? await supabase
        .from("rota_published_shifts")
        .select(
          "id, day_date, zone_id, zone_name_snapshot, shift_type, start_time, end_time, end_kind, split_second_start_time, split_second_end_time"
        )
        .eq("rota_id", rota.id)
        .order("day_date", { ascending: true })
        .order("start_time", { ascending: true })
    : await supabase
        .from("rota_shifts")
        .select(
          "id, day_date, zone_id, zone_name_snapshot, shift_type, start_time, end_time, end_kind, split_second_start_time, split_second_end_time"
        )
        .eq("rota_id", rota.id)
        .order("day_date", { ascending: true })
        .order("start_time", { ascending: true })

  assertSupabaseSuccess(
    shiftsResult.error,
    "We could not load the saved shifts."
  )
  const shifts = (shiftsResult.data ?? []).map((row) =>
    mapShiftRowToWorkspaceShift(row, days)
  )
  const shiftIds = shifts.map((shift) => shift.id)
  const assignments =
    shiftIds.length === 0
      ? []
      : publishedOnly
        ? await loadPublishedAssignments(supabase, shiftIds)
        : await loadWorkingAssignments(supabase, shiftIds)

  return {
    meta: {
      rotaId: rota.id,
      status: rota.status === "published" ? "published" : "draft",
      note: rota.note,
      weekStart: rota.week_start,
      weekEnd: days[6]?.isoDate ?? rota.week_start,
      weekLabel: buildWeekLabel(rota.week_start),
      publishedVersion: rota.published_version,
      hasUnpublishedChanges: rota.has_unpublished_changes,
      publishedSnapshotAvailable: rota.published_snapshot_version > 0,
    },
    location,
    days,
    zones: (zonesResult.data ?? []).map((zone) => ({
      id: zone.id,
      name: zone.name,
    })),
    employeeGroups,
    employees: employees.map((employee) => ({
      id: employee.id,
      name: employee.full_name,
      groupId: employee.staff_group_id ?? "ungrouped",
      groupColor:
        groupColorById.get(employee.staff_group_id ?? "ungrouped") ?? "slate",
      weeklyHours: 0,
    })),
    templates,
    shifts,
    assignments,
  }
}

async function getLocationEstimatedClosingTime(locationId: string) {
  const database = getDatabase()
  const result = await database.query<{
    estimated_closing_time: string
    estimated_closing_time_next_day: boolean
  }>(
    `select estimated_closing_time, estimated_closing_time_next_day
     from public.locations
     where id = $1
     limit 1`,
    [locationId]
  )

  return {
    estimatedClosingTime: result.rows[0]?.estimated_closing_time ?? "23:00",
    estimatedClosingTimeNextDay:
      result.rows[0]?.estimated_closing_time_next_day ?? false,
  }
}

async function loadWorkingAssignments(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  shiftIds: string[]
) {
  const result = await supabase
    .from("rota_shift_assignments")
    .select("id, employee_id, rota_shift_id")
    .in("rota_shift_id", shiftIds)

  assertSupabaseSuccess(
    result.error,
    "We could not load the shift assignments."
  )

  return (result.data ?? []).map((assignment) => ({
    id: assignment.id,
    employeeId: assignment.employee_id,
    shiftId: assignment.rota_shift_id,
  }))
}

async function loadPublishedAssignments(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  shiftIds: string[]
) {
  const result = await supabase
    .from("rota_published_shift_assignments")
    .select("id, employee_id, rota_published_shift_id")
    .in("rota_published_shift_id", shiftIds)

  assertSupabaseSuccess(
    result.error,
    "We could not load the shift assignments."
  )

  return (result.data ?? []).map((assignment) => ({
    id: assignment.id,
    employeeId: assignment.employee_id,
    shiftId: assignment.rota_published_shift_id,
  }))
}

export { getRotaWorkspaceData }
