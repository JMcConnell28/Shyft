import type {
  WorkspaceBoardData,
  WorkspaceEmployeeRotaNote,
  WorkspaceShift,
  WorkspaceZone,
} from "@/features/rota/types/workspace"
import { DEFAULT_MINIMUM_WAGE_PENCE } from "@/features/staff-groups/utils/minimum-wage"
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
import {
  getLocationOrganizationId,
  getTemplatesForLocation,
} from "@/features/rota/server/lookups"
import {
  buildWeekLabel,
  isRotaWeekBeforeCurrentWeek,
} from "@/features/rota/utils/week-utils"

type EmployeeRotaNoteRow = {
  body: string
  category: string
  employee_id: string
  id: string
  is_pinned: boolean
  location_name: string | null
  priority: string
  title: string
  zone_name: string | null
}

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

  const workspaceOrganizationId =
    organizationId ??
    (locationId ? await getLocationOrganizationId(locationId) : null)
  const role = locationId
    ? ((await getLocationRole(locationId, userId)) ??
      (workspaceOrganizationId
        ? await getMembershipRole(workspaceOrganizationId, userId)
        : null))
    : workspaceOrganizationId
      ? await getMembershipRole(workspaceOrganizationId, userId)
      : null
  const capabilities = getOrgCapabilitiesForRole(role)

  if (!capabilities.canViewRota) {
    throw new Error("You do not have permission to view rotas.")
  }

  const canViewWorkingRota =
    capabilities.canManageRota || capabilities.canManageTimeClock

  if (!publishedOnly && !canViewWorkingRota) {
    throw new Error("You do not have permission to view this rota.")
  }

  const locations = await listAccessibleLocations(
    workspaceOrganizationId,
    userId,
    role,
    locationId
  )
  const selectedLocation =
    locations.find((location) =>
      locationId ? location.id === locationId : location.slug === locationSlug
    ) ?? null

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
  const isPastRota = isRotaWeekBeforeCurrentWeek(rota.week_start)
  const database = getDatabase()
  const groupsQuery = supabase
    .from("staff_groups")
    .select("id, name, color")
    .order("name", { ascending: true })
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
      .is("deleted_at", null)
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
    workspaceOrganizationId
      ? groupsQuery.eq("organization_id", workspaceOrganizationId)
      : groupsQuery
          .is("organization_id", null)
          .eq("location_id", selectedLocation.id),
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
  const compensationByEmployeeId = capabilities.canViewRotaCosts
    ? await getEmployeeCompensationById(
        employees.map((employee) => employee.id)
      )
    : new Map<string, EmployeeCompensationRow>()
  const rotaNotesByEmployeeId = await getEmployeeRotaNotesByEmployeeId(
    employees.map((employee) => employee.id),
    selectedLocation.id
  )
  const budgetPence = capabilities.canViewRotaCosts
    ? await getRotaBudgetPence(rota.id)
    : null
  const employeeGroups = (groupsResult.data ?? []).map((group) => ({
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
  const zones = buildWorkspaceZones({
    activeZones: (zonesResult.data ?? []).map((zone) => ({
      id: zone.id,
      name: zone.name,
    })),
    preferShiftSnapshots: isPastRota,
    shifts,
  })
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
      canManage: capabilities.canManageRota,
      canEdit: capabilities.canManageRota && !isPastRota,
      organizationId: workspaceOrganizationId,
      userId,
      workspaceType: locationId ? "location" : "organization",
      note: rota.note,
      weekStart: rota.week_start,
      weekEnd: days[6]?.isoDate ?? rota.week_start,
      weekLabel: buildWeekLabel(rota.week_start),
      publishedVersion: rota.published_version,
      hasUnpublishedChanges: rota.has_unpublished_changes,
      publishedSnapshotAvailable: rota.published_snapshot_version > 0,
      budgetPence,
    },
    location,
    days,
    zones,
    employeeGroups,
    employees: employees.map((employee) => ({
      id: employee.id,
      name: employee.full_name,
      groupId: employee.staff_group_id ?? "ungrouped",
      groupColor:
        groupColorById.get(employee.staff_group_id ?? "ungrouped") ?? "slate",
      weeklyHours: 0,
      rotaNotes: rotaNotesByEmployeeId.get(employee.id) ?? [],
      compensation: (() => {
        const compensation = compensationByEmployeeId.get(employee.id)
        return compensation?.pay_type === "salary"
          ? {
              type: "salary" as const,
              weeklySalaryPence: compensation.weekly_salary_pence ?? 0,
            }
          : {
              type: "hourly" as const,
              hourlyRatePence:
                compensation?.hourly_rate_pence ?? DEFAULT_MINIMUM_WAGE_PENCE,
            }
      })(),
    })),
    templates,
    shifts,
    assignments,
  }
}

function buildWorkspaceZones({
  activeZones,
  preferShiftSnapshots,
  shifts,
}: {
  activeZones: WorkspaceZone[]
  preferShiftSnapshots: boolean
  shifts: WorkspaceShift[]
}) {
  const zoneById = new Map<string, WorkspaceZone>()

  if (!preferShiftSnapshots) {
    for (const zone of activeZones) {
      zoneById.set(zone.id, zone)
    }
  }

  for (const shift of shifts) {
    const shouldKeepActiveZoneName =
      !preferShiftSnapshots && zoneById.has(shift.zoneId)

    if (!shift.zoneName || shouldKeepActiveZoneName) {
      continue
    }

    zoneById.set(shift.zoneId, {
      id: shift.zoneId,
      isDeleted:
        preferShiftSnapshots ||
        !activeZones.some((zone) => zone.id === shift.zoneId),
      name: shift.zoneName,
    })
  }

  if (preferShiftSnapshots) {
    for (const zone of activeZones) {
      if (!zoneById.has(zone.id)) {
        zoneById.set(zone.id, zone)
      }
    }
  }

  return Array.from(zoneById.values())
}

type EmployeeCompensationRow = {
  employee_id: string
  pay_type: string
  hourly_rate_pence: number | null
  weekly_salary_pence: number | null
}

async function getEmployeeCompensationById(employeeIds: string[]) {
  if (employeeIds.length === 0) {
    return new Map<string, EmployeeCompensationRow>()
  }

  const result = await getDatabase().query<EmployeeCompensationRow>(
    `select employee_id, pay_type, hourly_rate_pence, weekly_salary_pence
     from public.employee_compensation
     where employee_id = any($1::uuid[])`,
    [employeeIds]
  )

  return new Map(result.rows.map((row) => [row.employee_id, row]))
}

async function getRotaBudgetPence(rotaId: string) {
  const result = await getDatabase().query<{ budget_pence: number }>(
    `select budget_pence
     from public.rota_budgets
     where rota_id = $1::uuid
     limit 1`,
    [rotaId]
  )

  return result.rows.at(0)?.budget_pence ?? null
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

async function getEmployeeRotaNotesByEmployeeId(
  employeeIds: string[],
  locationId: string
) {
  if (employeeIds.length === 0) {
    return new Map<string, WorkspaceEmployeeRotaNote[]>()
  }

  const result = await getDatabase().query<EmployeeRotaNoteRow>(
    `select note.employee_id,
            note.id,
            note.category,
            note.title,
            note.body,
            note.priority,
            note.is_pinned,
            location.name as location_name,
            zone.name as zone_name
     from public.employee_rota_notes note
     left join public.locations location on location.id = note.location_id
     left join public.zones zone on zone.id = note.zone_id
     where note.employee_id = any($1::uuid[])
       and note.status = 'active'
       and (
         note.location_id is null
         or note.location_id = $2::uuid
       )
       and (
         note.zone_id is null
         or zone.location_id = $2::uuid
       )
     order by note.is_pinned desc,
              case note.priority
                when 'high' then 1
                when 'normal' then 2
                else 3
              end,
              note.updated_at desc`,
    [employeeIds, locationId]
  )

  const notesByEmployeeId = new Map<string, WorkspaceEmployeeRotaNote[]>()

  for (const row of result.rows) {
    const notes = notesByEmployeeId.get(row.employee_id) ?? []
    notes.push({
      body: row.body,
      category: normalizeRotaNoteCategory(row.category),
      id: row.id,
      isPinned: row.is_pinned,
      locationName: row.location_name,
      priority: normalizeRotaNotePriority(row.priority),
      title: row.title,
      zoneName: row.zone_name,
    })
    notesByEmployeeId.set(row.employee_id, notes)
  }

  return notesByEmployeeId
}

function normalizeRotaNoteCategory(
  category: string
): WorkspaceEmployeeRotaNote["category"] {
  if (
    category === "skill" ||
    category === "constraint" ||
    category === "preference" ||
    category === "warning"
  ) {
    return category
  }

  return "general"
}

function normalizeRotaNotePriority(
  priority: string
): WorkspaceEmployeeRotaNote["priority"] {
  if (priority === "low" || priority === "high") {
    return priority
  }

  return "normal"
}

export { getRotaWorkspaceData }
