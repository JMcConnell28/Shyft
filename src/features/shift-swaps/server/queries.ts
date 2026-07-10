import { format, parseISO } from "date-fns"

import type {
  ShiftSwapPageData,
  ShiftSwapRequestSummary,
  ShiftSwapRotaOption,
  ShiftSwapShift,
} from "@/features/shift-swaps/types"
import {
  getShiftSwapContext,
  listPublishedShiftRows,
  listUserEmployees,
  mapShiftRow,
  type PublishedShiftRow,
  type RequestRow,
  type ShiftSwapScopeInput,
} from "@/features/shift-swaps/server/shared"
import { getShiftSwapCutoffAt, isPastShiftSwapCutoff } from "@/features/shift-swaps/utils/shift-swap-rules"
import { buildWeekLabel } from "@/features/rota/utils/week-utils"
import { getDatabase } from "@/lib/db"

async function listShiftSwapPageData(
  input: ShiftSwapScopeInput
): Promise<ShiftSwapPageData> {
  const context = await getShiftSwapContext(input)
  const [userEmployees, shiftRows, requestRows] = await Promise.all([
    listUserEmployees(context),
    listPublishedShiftRows(context),
    listRequestRows(context.locationIds),
  ])
  const userEmployeeIds = new Set(userEmployees.map((employee) => employee.id))
  const shifts = shiftRows.map(mapShiftRow)
  const ownShifts = shifts.filter((shift) => userEmployeeIds.has(shift.employeeId))
  const swapTargetShifts = shifts.filter(
    (shift) => !userEmployeeIds.has(shift.employeeId) && !shift.isPastCutoff
  )
  const requests = requestRows.map(mapRequestRow)

  return {
    canManage: context.canManage,
    rotas: buildRotaOptions(ownShifts),
    ownShifts: ownShifts.filter((shift) => !shift.isPastCutoff),
    swapTargetShifts,
    incomingRequests: requests.filter(
      (request) =>
        request.status === "awaiting_peer" &&
        request.targetEmployee &&
        userEmployeeIds.has(request.targetEmployee.id)
    ),
    openCoverRequests: requests.filter(
      (request) =>
        request.requestType === "cover" &&
        request.status === "open" &&
        isEligibleOpenCoverRequest(request, userEmployees)
    ),
    myRequests: requests.filter((request) => userEmployeeIds.has(request.requester.id)),
    managerRequests: context.canManage
      ? requests.filter((request) => request.status === "pending_manager")
      : [],
  }
}

async function listRequestRows(locationIds: string[]) {
  if (locationIds.length === 0) {
    return []
  }

  const result = await getDatabase().query<RequestRow>(
    `select request.id,
            request.request_type,
            request.status,
            request.accepted_response_id,
            request.created_at::text,
            request.cutoff_at::text,
            request.manager_note,
            requester.id as requester_employee_id,
            requester.full_name as requester_name,
            requester.staff_group_id as requester_staff_group_id,
            coalesce(requester_group.name, 'Team members') as requester_staff_group_name,
            response.id as response_id,
            responder.id as responder_employee_id,
            responder.full_name as responder_name,
            responder.staff_group_id as responder_staff_group_id,
            coalesce(responder_group.name, 'Team members') as responder_staff_group_name,
            source_assignment.id as source_assignment_id,
            source_assignment.employee_id as source_employee_id,
            source_employee.full_name as source_employee_name,
            source_employee.staff_group_id as source_staff_group_id,
            coalesce(source_group.name, 'Team members') as source_staff_group_name,
            source_shift.id as source_published_shift_id,
            source_shift.working_shift_id as source_working_shift_id,
            source_shift.rota_id as source_rota_id,
            source_shift.day_date::text as source_date,
            source_shift.zone_name_snapshot as source_zone_name,
            source_shift.shift_type as source_shift_type,
            source_shift.start_time::text as source_start_time,
            source_shift.end_time::text as source_end_time,
            source_shift.end_kind as source_end_kind,
            source_shift.split_second_start_time::text as source_split_second_start_time,
            source_shift.split_second_end_time::text as source_split_second_end_time,
            source_rota.week_start::text as source_week_start,
            source_location.id as source_location_id,
            source_location.name as source_location_name,
            ((source_shift.day_date + source_shift.start_time) at time zone coalesce(source_clock.timezone, 'Europe/London'))::text as source_starts_at,
            target_assignment.id as target_assignment_id,
            target_assignment.employee_id as target_employee_id,
            target_employee.full_name as target_employee_name,
            target_employee.staff_group_id as target_staff_group_id,
            coalesce(target_group.name, 'Team members') as target_staff_group_name,
            target_shift.id as target_published_shift_id,
            target_shift.working_shift_id as target_working_shift_id,
            target_shift.rota_id as target_rota_id,
            target_shift.day_date::text as target_date,
            target_shift.zone_name_snapshot as target_zone_name,
            target_shift.shift_type as target_shift_type,
            target_shift.start_time::text as target_start_time,
            target_shift.end_time::text as target_end_time,
            target_shift.end_kind as target_end_kind,
            target_shift.split_second_start_time::text as target_split_second_start_time,
            target_shift.split_second_end_time::text as target_split_second_end_time,
            target_rota.week_start::text as target_week_start,
            target_location.id as target_location_id,
            target_location.name as target_location_name,
            ((target_shift.day_date + target_shift.start_time) at time zone coalesce(target_clock.timezone, 'Europe/London'))::text as target_starts_at
     from public.shift_swap_requests request
     join public.employees requester on requester.id = request.requester_employee_id
     left join public.staff_groups requester_group on requester_group.id = requester.staff_group_id
     join public.rota_published_shift_assignments source_assignment
       on source_assignment.id = request.source_assignment_id
     join public.employees source_employee on source_employee.id = source_assignment.employee_id
     left join public.staff_groups source_group on source_group.id = source_employee.staff_group_id
     join public.rota_published_shifts source_shift
       on source_shift.id = request.source_published_shift_id
     join public.rotas source_rota on source_rota.id = source_shift.rota_id
     join public.locations source_location on source_location.id = source_rota.location_id
     left join public.location_clock_settings source_clock on source_clock.location_id = source_rota.location_id
     left join public.rota_published_shift_assignments target_assignment
       on target_assignment.id = request.target_assignment_id
     left join public.employees target_employee on target_employee.id = target_assignment.employee_id
     left join public.staff_groups target_group on target_group.id = target_employee.staff_group_id
     left join public.rota_published_shifts target_shift
       on target_shift.id = request.target_published_shift_id
     left join public.rotas target_rota on target_rota.id = target_shift.rota_id
     left join public.locations target_location on target_location.id = target_rota.location_id
     left join public.location_clock_settings target_clock on target_clock.location_id = target_rota.location_id
     left join public.shift_swap_responses response
       on response.id = request.accepted_response_id
     left join public.employees responder on responder.id = response.responder_employee_id
     left join public.staff_groups responder_group on responder_group.id = responder.staff_group_id
     where request.location_id = any($1::uuid[])
       and request.created_at >= timezone('utc', now()) - interval '90 days'
     order by request.created_at desc`,
    [locationIds]
  )

  return result.rows
}

function buildRotaOptions(shifts: ShiftSwapShift[]) {
  const rotaById = new Map<string, ShiftSwapRotaOption>()

  for (const shift of shifts) {
    if (rotaById.has(shift.rotaId)) {
      continue
    }

    rotaById.set(shift.rotaId, {
      id: shift.rotaId,
      locationId: shift.locationId,
      locationName: shift.locationName,
      weekLabel: shift.weekLabel,
      weekStart: shift.weekStart,
    })
  }

  return Array.from(rotaById.values())
}

function mapRequestRow(row: RequestRow): ShiftSwapRequestSummary {
  const cutoffAt = new Date(row.cutoff_at)
  const status =
    isPastShiftSwapCutoff(cutoffAt) &&
    (row.status === "awaiting_peer" ||
      row.status === "open" ||
      row.status === "pending_manager")
      ? "expired"
      : row.status

  return {
    id: row.id,
    requestType: row.request_type,
    status,
    sourceShift: mapRequestShift(row, "source"),
    requester: {
      id: row.requester_employee_id,
      name: row.requester_name,
      staffGroupId: row.requester_staff_group_id,
      staffGroupName: row.requester_staff_group_name ?? "Team members",
    },
    targetEmployee: row.target_employee_id
      ? {
          id: row.target_employee_id,
          name: row.target_employee_name ?? "Unknown team member",
          staffGroupId: row.target_staff_group_id,
          staffGroupName: row.target_staff_group_name ?? "Team members",
        }
      : null,
    targetShift: row.target_published_shift_id ? mapRequestShift(row, "target") : null,
    responder: row.responder_employee_id
      ? {
          id: row.responder_employee_id,
          name: row.responder_name ?? "Unknown team member",
          staffGroupId: row.responder_staff_group_id,
          staffGroupName: row.responder_staff_group_name ?? "Team members",
        }
      : null,
    responseId: row.response_id,
    createdAt: new Date(row.created_at).toISOString(),
    cutoffAt: cutoffAt.toISOString(),
    managerNote: row.manager_note,
  }
}

function mapRequestShift(row: RequestRow, kind: "source" | "target"): ShiftSwapShift {
  const startsAtText = kind === "source" ? row.source_starts_at : row.target_starts_at
  const startsAt = new Date(startsAtText ?? row.source_starts_at)
  const cutoffAt = getShiftSwapCutoffAt(startsAt)
  const date = kind === "source" ? row.source_date : (row.target_date ?? row.source_date)
  const weekStart =
    kind === "source" ? row.source_week_start : (row.target_week_start ?? row.source_week_start)

  return {
    assignmentId:
      kind === "source" ? row.source_assignment_id : (row.target_assignment_id ?? ""),
    publishedShiftId:
      kind === "source"
        ? row.source_published_shift_id
        : (row.target_published_shift_id ?? ""),
    workingShiftId:
      kind === "source" ? row.source_working_shift_id : row.target_working_shift_id,
    rotaId: kind === "source" ? row.source_rota_id : (row.target_rota_id ?? ""),
    locationId:
      kind === "source" ? row.source_location_id : (row.target_location_id ?? ""),
    locationName:
      kind === "source" ? row.source_location_name : (row.target_location_name ?? ""),
    employeeId:
      kind === "source" ? row.source_employee_id : (row.target_employee_id ?? ""),
    employeeName:
      kind === "source"
        ? row.source_employee_name
        : (row.target_employee_name ?? "Unknown team member"),
    staffGroupId:
      kind === "source" ? row.source_staff_group_id : row.target_staff_group_id,
    staffGroupName:
      kind === "source"
        ? (row.source_staff_group_name ?? "Team members")
        : (row.target_staff_group_name ?? "Team members"),
    weekLabel: buildWeekLabel(weekStart),
    weekStart,
    date,
    dateLabel: format(parseISO(date), "EEE d MMM"),
    timeLabel:
      kind === "source"
        ? getRequestShiftTimeLabel({
            date,
            shiftType: row.source_shift_type,
            startTime: row.source_start_time,
            endTime: row.source_end_time,
            endKind: row.source_end_kind,
            splitSecondStartTime: row.source_split_second_start_time,
            splitSecondEndTime: row.source_split_second_end_time,
          })
        : getRequestShiftTimeLabel({
            date,
            shiftType: row.target_shift_type ?? "standard",
            startTime: row.target_start_time ?? "00:00",
            endTime: row.target_end_time,
            endKind: row.target_end_kind,
            splitSecondStartTime: row.target_split_second_start_time,
            splitSecondEndTime: row.target_split_second_end_time,
          }),
    zoneName: kind === "source" ? row.source_zone_name : (row.target_zone_name ?? ""),
    startsAt: startsAt.toISOString(),
    cutoffAt: cutoffAt.toISOString(),
    isPastCutoff: isPastShiftSwapCutoff(cutoffAt),
  }
}

function getRequestShiftTimeLabel(shift: Pick<PublishedShiftRow, "date" | "shiftType" | "startTime" | "endTime" | "endKind" | "splitSecondStartTime" | "splitSecondEndTime">) {
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

function isEligibleOpenCoverRequest(
  request: ShiftSwapRequestSummary,
  userEmployees: Array<{ id: string; staff_group_id: string | null; location_id: string }>
) {
  return userEmployees.some(
    (employee) =>
      employee.id !== request.requester.id &&
      employee.location_id === request.sourceShift.locationId &&
      employee.staff_group_id === request.requester.staffGroupId
  )
}

export { listShiftSwapPageData }
