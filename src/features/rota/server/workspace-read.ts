import type {
  WorkspaceBoardData,
  WorkspaceEmployeeRotaNote,
  WorkspaceShift,
  WorkspaceZone,
} from "@/features/rota/types/workspace"
import { getLocationEntitlement } from "@/features/billing/server/entitlements"
import { DEFAULT_MINIMUM_WAGE_PENCE } from "@/features/staff-groups/utils/minimum-wage"
import { normalizeStaffGroupColor } from "@/features/staff-groups/constants/staff-group-colors"
import { getOrgCapabilitiesForRole } from "@/lib/auth/get-org-capabilities"
import { getDatabase } from "@/lib/db"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

import { listWorkspaceEmployees } from "@/features/rota/server/workspace-employee-read"
import { getAccessibleWorkspaceLocation } from "@/features/rota/server/workspace-location-read"
import {
  loadWorkspaceAssignments,
  loadWorkspaceShifts,
} from "@/features/rota/server/workspace-shift-read"
import { getMembershipRole } from "@/features/rota/server/membership"
import { requireVerifiedSessionOrThrow } from "@/features/rota/server/request-session"
import { getLocationRotaSettings } from "@/features/rota/server/rota-settings"
import {
  buildWorkspaceDays,
  buildWorkspaceLocation,
} from "@/features/rota/server/workspace-shared"
import { getTemplatesForLocation } from "@/features/rota/server/lookups"
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
  userId,
  locationSlug,
  rotaId,
  publishedOnly,
}: {
  organizationId: string
  userId: string
  orgSlug: string
  locationSlug: string
  rotaId: string
  publishedOnly: boolean
}): Promise<WorkspaceBoardData> {
  const { session } = await requireVerifiedSessionOrThrow()

  if (
    session.user.id !== userId ||
    session.session.activeOrganizationId !== organizationId
  ) {
    throw new Error(
      "Your workspace session is no longer valid. Refresh and try again."
    )
  }

  const role = await getMembershipRole(organizationId, userId)
  const capabilities = getOrgCapabilitiesForRole(role)

  if (!capabilities.canViewRota) {
    throw new Error("You do not have permission to view rotas.")
  }

  const canViewWorkingRota =
    capabilities.canManageRota || capabilities.canManageTimeClock

  if (!publishedOnly && !canViewWorkingRota) {
    throw new Error("You do not have permission to view this rota.")
  }

  const selectedLocation = await getAccessibleWorkspaceLocation({
    organizationId,
    locationSlug,
    userId,
    canViewManagedLocations:
      capabilities.canManageRota || capabilities.canManageTimeClock,
  })

  if (!selectedLocation) {
    throw new Error("You do not have access to that location.")
  }

  const supabase = createSupabaseServerClient()
  const rotaQuery = supabase
    .from("rotas")
    .select(
      "id, status, note, week_start, content_version, published_content_version, published_version, published_snapshot_version, has_unpublished_changes"
    )
    .eq("location_id", selectedLocation.id)
    .eq("id", rotaId)
  const [entitlement, rotaResult] = await Promise.all([
    getLocationEntitlement(selectedLocation.id),
    rotaQuery.eq("organization_id", organizationId).maybeSingle(),
  ])

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
    employees,
    groupsResult,
    templates,
    rotaSettings,
    shifts,
    budgetPence,
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
    listWorkspaceEmployees({
      organizationId,
      locationId: selectedLocation.id,
      includeHiddenEmployees: isPastRota,
    }),
    groupsQuery.eq("organization_id", organizationId),
    publishedOnly
      ? Promise.resolve([])
      : getTemplatesForLocation(organizationId, selectedLocation.id),
    getLocationRotaSettings(selectedLocation.id),
    loadWorkspaceShifts(supabase, rota.id, days, publishedOnly),
    !publishedOnly && capabilities.canViewRotaCosts
      ? getRotaBudgetPence(rota.id)
      : Promise.resolve(null),
  ])

  assertSupabaseSuccess(zonesResult.error, "We could not load the rota zones.")
  assertSupabaseSuccess(groupsResult.error, "We could not load staff groups.")

  const location = buildWorkspaceLocation(
    selectedLocation,
    days,
    hoursResult.rows
  )
  const employeeIds = employees.map((employee) => employee.id)
  const [compensationByEmployeeId, rotaNotesByEmployeeId, assignments] =
    await Promise.all([
      !publishedOnly && capabilities.canViewRotaCosts
        ? getEmployeeCompensationById(employeeIds)
        : Promise.resolve(new Map<string, EmployeeCompensationRow>()),
      publishedOnly
        ? Promise.resolve(new Map<string, Array<WorkspaceEmployeeRotaNote>>())
        : getEmployeeRotaNotesByEmployeeId(employeeIds, selectedLocation.id),
      loadWorkspaceAssignments(supabase, shifts, publishedOnly),
    ])
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

  const zones = buildWorkspaceZones({
    activeZones: (zonesResult.data ?? []).map((zone) => ({
      id: zone.id,
      name: zone.name,
    })),
    preferShiftSnapshots: isPastRota,
    shifts,
  })
  return {
    meta: {
      rotaId: rota.id,
      status: rota.status === "published" ? "published" : "draft",
      canManage: capabilities.canManageRota && entitlement.canWrite,
      canEdit:
        capabilities.canManageRota &&
        entitlement.canWrite &&
        !isPastRota &&
        (rota.status !== "published" || rotaSettings.allowEditAfterPublish),
      organizationId,
      userId,
      workspaceType: "organization",
      note: publishedOnly && !rotaSettings.showNotesToStaff ? null : rota.note,
      weekStart: rota.week_start,
      weekEnd: days[6]?.isoDate ?? rota.week_start,
      weekLabel: buildWeekLabel(rota.week_start),
      contentVersion: publishedOnly
        ? rota.published_content_version
        : rota.content_version,
      publishedContentVersion: rota.published_content_version,
      publishedVersion: rota.published_version,
      hasUnpublishedChanges: rota.has_unpublished_changes,
      publishedSnapshotAvailable: rota.published_snapshot_version > 0,
      budgetPence,
      settings: rotaSettings,
    },
    location,
    days,
    zones,
    employeeGroups,
    employees: employees.map((employee) => {
      const groupId = employee.staff_group_id ?? "ungrouped"

      return {
        id: employee.id,
        name: employee.full_name,
        groupId,
        groupColor: groupColorById.get(groupId) ?? "slate",
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
      }
    }),
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
  activeZones: Array<WorkspaceZone>
  preferShiftSnapshots: boolean
  shifts: Array<WorkspaceShift>
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

async function getEmployeeCompensationById(employeeIds: Array<string>) {
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

async function getEmployeeRotaNotesByEmployeeId(
  employeeIds: Array<string>,
  locationId: string
) {
  if (employeeIds.length === 0) {
    return new Map<string, Array<WorkspaceEmployeeRotaNote>>()
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

  const notesByEmployeeId = new Map<string, Array<WorkspaceEmployeeRotaNote>>()

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
