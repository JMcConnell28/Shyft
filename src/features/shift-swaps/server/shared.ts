import { format, parseISO } from "date-fns"
import type { PoolClient } from "pg"

import { listAccessibleLocations } from "@/features/rota/server/access"
import { getLocationOrganizationId } from "@/features/rota/server/lookups"
import { getMembershipRole } from "@/features/rota/server/membership"
import { requireVerifiedSessionOrThrow } from "@/features/rota/server/request-session"
import {
  getCurrentWeekStart,
  buildWeekLabel,
} from "@/features/rota/utils/week-utils"
import type { ShiftSwapShift } from "@/features/shift-swaps/types"
import {
  getShiftSwapCutoffAt,
  isPastShiftSwapCutoff,
  shiftsOverlap,
  type ShiftSwapCandidateShift,
} from "@/features/shift-swaps/utils/shift-swap-rules"
import { getOrgCapabilitiesForRole } from "@/lib/auth/get-org-capabilities"
import { getLocationRole } from "@/lib/auth/has-location-permission"
import { getDatabase } from "@/lib/db"

type ShiftSwapScopeInput = {
  organizationId?: string
  locationId?: string
  userId: string
}

type ShiftSwapContext = {
  canManage: boolean
  locationIds: string[]
  organizationId: string | null
  userId: string
}

type EmployeeAccessRow = {
  id: string
  full_name: string
  staff_group_id: string | null
  staff_group_name: string | null
  location_id: string
}

type PublishedShiftRow = ShiftSwapCandidateShift & {
  assignment_id: string
  employee_id: string
  employee_user_id: string | null
  employee_name: string
  staff_group_id: string | null
  staff_group_name: string | null
  location_id: string
  location_name: string
  published_shift_id: string
  rota_id: string
  week_start: string
  working_shift_id: string | null
  zone_name: string
  starts_at: string
}

type RequestRow = {
  id: string
  request_type: "swap" | "cover"
  status:
    | "awaiting_peer"
    | "open"
    | "pending_manager"
    | "approved"
    | "denied"
    | "cancelled"
    | "expired"
  accepted_response_id: string | null
  created_at: string
  cutoff_at: string
  manager_note: string | null
  requester_employee_id: string
  requester_name: string
  requester_staff_group_id: string | null
  requester_staff_group_name: string | null
  responder_employee_id: string | null
  responder_name: string | null
  responder_staff_group_id: string | null
  responder_staff_group_name: string | null
  response_id: string | null
  source_assignment_id: string
  source_date: string
  source_employee_id: string
  source_employee_name: string
  source_end_kind: string | null
  source_end_time: string | null
  source_location_id: string
  source_location_name: string
  source_published_shift_id: string
  source_rota_id: string
  source_shift_type: string
  source_split_second_end_time: string | null
  source_split_second_start_time: string | null
  source_staff_group_id: string | null
  source_staff_group_name: string | null
  source_start_time: string
  source_starts_at: string
  source_week_start: string
  source_working_shift_id: string | null
  source_zone_name: string
  target_assignment_id: string | null
  target_date: string | null
  target_employee_id: string | null
  target_employee_name: string | null
  target_end_kind: string | null
  target_end_time: string | null
  target_location_id: string | null
  target_location_name: string | null
  target_published_shift_id: string | null
  target_rota_id: string | null
  target_shift_type: string | null
  target_split_second_end_time: string | null
  target_split_second_start_time: string | null
  target_staff_group_id: string | null
  target_staff_group_name: string | null
  target_start_time: string | null
  target_starts_at: string | null
  target_week_start: string | null
  target_working_shift_id: string | null
  target_zone_name: string | null
}

async function getShiftSwapContext(input: ShiftSwapScopeInput) {
  const { session } = await requireVerifiedSessionOrThrow()

  if (
    session.user.id !== input.userId ||
    (input.organizationId &&
      session.session.activeOrganizationId !== input.organizationId)
  ) {
    throw new Error(
      "Your workspace session is no longer valid. Refresh and try again."
    )
  }

  const organizationId =
    input.organizationId ??
    (input.locationId
      ? await getLocationOrganizationId(input.locationId)
      : null)
  const role = input.locationId
    ? ((await getLocationRole(input.locationId, input.userId)) ??
      (organizationId
        ? await getMembershipRole(organizationId, input.userId)
        : null))
    : organizationId
      ? await getMembershipRole(organizationId, input.userId)
      : null
  const capabilities = getOrgCapabilitiesForRole(role)

  if (!capabilities.canViewRota) {
    throw new Error("You do not have permission to view shift swaps.")
  }

  const locations = organizationId
    ? await listAccessibleLocations(
        organizationId,
        input.userId,
        role,
        input.locationId
      )
    : input.locationId
      ? await listAccessibleLocations(
          null,
          input.userId,
          role,
          input.locationId
        )
      : []
  const locationIds = input.locationId
    ? locations
        .filter((location) => location.id === input.locationId)
        .map((location) => location.id)
    : locations.map((location) => location.id)

  if (locationIds.length === 0) {
    throw new Error("Choose a valid location.")
  }

  return {
    canManage: capabilities.canUpdateRota,
    locationIds,
    organizationId,
    userId: input.userId,
  } satisfies ShiftSwapContext
}

async function listUserEmployees(context: ShiftSwapContext) {
  const result = await getDatabase().query<EmployeeAccessRow>(
    `select employee.id,
            employee.full_name,
            employee.staff_group_id,
            coalesce(staff_group.name, 'Team members') as staff_group_name,
            assignment.location_id
     from public.employee_location_assignments assignment
     join public.employees employee on employee.id = assignment.employee_id
     left join public.staff_groups staff_group on staff_group.id = employee.staff_group_id
     where employee.user_id = $1
       and employee.status = 'active'
       and assignment.is_enabled = true
       and assignment.disabled_at is null
       and assignment.location_id = any($2::uuid[])
       and (($3::text is null and employee.organization_id is null) or employee.organization_id = $3::text)`,
    [context.userId, context.locationIds, context.organizationId]
  )

  return result.rows
}

async function listPublishedShiftRows(context: ShiftSwapContext) {
  const result = await getDatabase().query<PublishedShiftRow>(
    `select assignment.id as assignment_id,
            assignment.employee_id,
            employee.user_id as employee_user_id,
            employee.full_name as employee_name,
            employee.staff_group_id,
            coalesce(staff_group.name, 'Team members') as staff_group_name,
            location.id as location_id,
            location.name as location_name,
            shift.id as published_shift_id,
            shift.working_shift_id,
            shift.rota_id,
            shift.day_date::text as date,
            shift.zone_name_snapshot as zone_name,
            shift.shift_type as "shiftType",
            shift.start_time::text as "startTime",
            shift.end_time::text as "endTime",
            shift.end_kind as "endKind",
            shift.split_second_start_time::text as "splitSecondStartTime",
            shift.split_second_end_time::text as "splitSecondEndTime",
            rota.week_start::text,
            ((shift.day_date + shift.start_time) at time zone coalesce(clock_settings.timezone, 'Europe/London'))::text as starts_at
     from public.rota_published_shift_assignments assignment
     join public.rota_published_shifts shift on shift.id = assignment.rota_published_shift_id
     join public.rotas rota on rota.id = shift.rota_id
     join public.locations location on location.id = rota.location_id
     join public.employees employee on employee.id = assignment.employee_id
     join public.employee_location_assignments location_assignment
       on location_assignment.employee_id = employee.id
      and location_assignment.location_id = rota.location_id
      and location_assignment.is_enabled = true
      and location_assignment.disabled_at is null
     left join public.staff_groups staff_group on staff_group.id = employee.staff_group_id
     left join public.location_clock_settings clock_settings on clock_settings.location_id = rota.location_id
     where rota.status = 'published'
       and rota.week_start >= $1::date
       and rota.location_id = any($2::uuid[])
       and employee.status = 'active'
       and (($3::text is null and rota.organization_id is null) or rota.organization_id = $3::text)
     order by shift.day_date asc, shift.start_time asc, employee.full_name asc`,
    [getCurrentWeekStart(), context.locationIds, context.organizationId]
  )

  return result.rows
}

function mapShiftRow(row: PublishedShiftRow): ShiftSwapShift {
  const startsAt = new Date(row.starts_at)
  const cutoffAt = getShiftSwapCutoffAt(startsAt)

  return {
    assignmentId: row.assignment_id,
    publishedShiftId: row.published_shift_id,
    workingShiftId: row.working_shift_id,
    rotaId: row.rota_id,
    locationId: row.location_id,
    locationName: row.location_name,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    staffGroupId: row.staff_group_id,
    staffGroupName: row.staff_group_name ?? "Team members",
    weekLabel: buildWeekLabel(row.week_start),
    weekStart: row.week_start,
    date: row.date,
    dateLabel: format(parseISO(row.date), "EEE d MMM"),
    timeLabel: getShiftTimeLabel(row),
    zoneName: row.zone_name,
    startsAt: startsAt.toISOString(),
    cutoffAt: cutoffAt.toISOString(),
    isPastCutoff: isPastShiftSwapCutoff(cutoffAt),
  }
}

function getShiftTimeLabel(shift: ShiftSwapCandidateShift) {
  const startTime = formatTime(shift.startTime)

  if (shift.shiftType === "closing") {
    return `${startTime} - Close`
  }

  if (shift.shiftType === "split") {
    return `${startTime} - ${formatTime(shift.endTime)}, ${formatTime(
      shift.splitSecondStartTime
    )} - ${formatTime(shift.splitSecondEndTime)}`
  }

  return `${startTime} - ${formatTime(shift.endTime)}`
}

function formatTime(value: string | null) {
  return value?.slice(0, 5) ?? "--:--"
}

function toCandidateShift(row: PublishedShiftRow): ShiftSwapCandidateShift {
  return {
    date: row.date,
    shiftType: row.shiftType,
    startTime: row.startTime,
    endTime: row.endTime,
    endKind: row.endKind,
    splitSecondStartTime: row.splitSecondStartTime,
    splitSecondEndTime: row.splitSecondEndTime,
  }
}

function hasShiftOverlap(
  candidate: PublishedShiftRow,
  existingShifts: PublishedShiftRow[]
) {
  return existingShifts.some((shift) =>
    shiftsOverlap(toCandidateShift(candidate), toCandidateShift(shift))
  )
}

async function hasTimeEntryForShift(input: {
  client?: PoolClient
  employeeId: string
  publishedShiftId: string
}) {
  const executor = input.client ?? getDatabase()
  const result = await executor.query<{ exists: boolean }>(
    `select exists(
       select 1
       from public.time_entries
       where employee_id = $1::uuid
         and rota_published_shift_id = $2::uuid
     )`,
    [input.employeeId, input.publishedShiftId]
  )

  return Boolean(result.rows[0]?.exists)
}

export {
  getShiftSwapContext,
  hasShiftOverlap,
  hasTimeEntryForShift,
  listPublishedShiftRows,
  listUserEmployees,
  mapShiftRow,
  toCandidateShift,
}
export type {
  EmployeeAccessRow,
  PublishedShiftRow,
  RequestRow,
  ShiftSwapContext,
  ShiftSwapScopeInput,
}
