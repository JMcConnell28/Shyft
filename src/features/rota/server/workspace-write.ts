import { createServerFn } from "@tanstack/react-start"
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns"
import type { PoolClient } from "pg"

import type {
  CreateWorkspaceShiftInput,
  WorkspaceAssignment,
  WorkspaceAssignmentMutationResult,
  WorkspaceShift,
} from "@/features/rota/types/workspace"
import type { CopyRotaBoardResult } from "@/features/rota/types"
import { getDatabase } from "@/lib/db"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess, getRequiredSupabaseRow } from "@/lib/supabase-errors"

import {
  assignRotaShiftEmployeeInputSchema,
  copyRotaBoardInputSchema,
  createRotaShiftInputSchema,
  moveRotaShiftAssignmentInputSchema,
  removeRotaShiftAssignmentInputSchema,
  saveRotaWorkspaceInputSchema,
} from "@/features/rota/schemas/rota-server-schemas"
import { requireRotaWriteAccess } from "@/features/rota/server/write-access"
import {
  buildWorkspaceDays,
  buildWorkspaceLocation,
  mapCreateShiftInputToShiftInsert,
  mapShiftRowToWorkspaceShift,
} from "@/features/rota/server/workspace-shared"
import { buildWeekLabel } from "@/features/rota/utils/week-utils"
import {
  getShiftAbsoluteSegments,
  getShiftDurationMinutes,
} from "@/features/rota/utils/workspace-shifts"

const saveRotaWorkspace = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => saveRotaWorkspaceInputSchema.parse(input))
  .handler(async ({ data }) => {
    const context = await getManagedRotaContext(data.rotaId)
    const zoneSnapshotById = await getZoneSnapshotById(context)

    const validEmployeeIds = await listValidEmployeeIdsForLocation(context)

    for (const assignment of data.assignments) {
      if (!validEmployeeIds.has(assignment.employeeId)) {
        throw new Error("One of the assigned team members is not available for this location.")
      }
    }

    const database = getDatabase()
    const client = await database.connect()

    try {
      await client.query("BEGIN")

      const shiftIdByClientId = new Map<string, string>()

      await client.query(
        `delete from public.rota_shift_assignments
         where rota_shift_id in (
           select id from public.rota_shifts where rota_id = $1
         )`,
        [context.rota.id]
      )
      await client.query(`delete from public.rota_shifts where rota_id = $1`, [
        context.rota.id,
      ])

      for (const shift of data.shifts) {
        const row = mapCreateShiftInputToShiftInsert(
          toCreateWorkspaceShiftInput(
            {
              ...shift,
              ...resolveZoneSnapshot({
                shift,
                zoneSnapshotById,
              }),
            },
          ),
          context.days
        )
        const insertedShift = await client.query<{
          id: string
        }>(
          `insert into public.rota_shifts (
             rota_id,
             organization_id,
             day_date,
             zone_id,
             zone_name_snapshot,
             shift_type,
             start_time,
             end_time,
             end_kind,
             split_second_start_time,
             split_second_end_time
           ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           returning id`,
          [
            context.rota.id,
            context.organizationId,
            row.day_date,
            row.zone_id,
            row.zone_name_snapshot,
            row.shift_type,
            row.start_time,
            row.end_time,
            row.end_kind,
            row.split_second_start_time,
            row.split_second_end_time,
          ]
        )

        shiftIdByClientId.set(shift.id, insertedShift.rows[0].id)
      }

      for (const assignment of data.assignments) {
        const savedShiftId = shiftIdByClientId.get(assignment.shiftId)

        if (!savedShiftId) {
          throw new Error("One of the saved assignments points to a missing shift.")
        }

        await client.query(
          `insert into public.rota_shift_assignments (
             rota_shift_id,
             employee_id
           ) values ($1, $2)`,
          [savedShiftId, assignment.employeeId]
        )
      }

      await recalculateRotaSummaryWithClient(context, client)
      await markRotaDraftDirtyIfNeededWithClient(context, client)
      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }

    return { success: true }
  })

const createRotaShift = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createRotaShiftInputSchema.parse(input))
  .handler(async ({ data }) => {
    const context = await getManagedRotaContext(data.rotaId)
    const zone = await getZoneForLocationOrThrow(
      context.location.id,
      context.organizationId,
      data.shift.zoneId
    )

    const shiftRow = mapCreateShiftInputToShiftInsert(
      {
        ...data.shift,
        zoneName: zone.name,
      },
      context.days,
    )
    const insertResult = await getDatabase().query<{
      day_date: string
      end_kind: string | null
      end_time: string | null
      id: string
      shift_type: string
      split_second_end_time: string | null
      split_second_start_time: string | null
      start_time: string
      zone_id: string | null
      zone_name_snapshot: string
    }>(
      `insert into public.rota_shifts (
         rota_id,
         organization_id,
         day_date,
         zone_id,
         zone_name_snapshot,
         shift_type,
         start_time,
         end_time,
         end_kind,
         split_second_start_time,
         split_second_end_time
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       returning
         id,
         day_date,
         zone_id,
         zone_name_snapshot,
         shift_type,
         start_time,
         end_time,
         end_kind,
         split_second_start_time,
         split_second_end_time`,
      [
        context.rota.id,
        context.organizationId,
        shiftRow.day_date,
        shiftRow.zone_id,
        shiftRow.zone_name_snapshot,
        shiftRow.shift_type,
        shiftRow.start_time,
        shiftRow.end_time,
        shiftRow.end_kind,
        shiftRow.split_second_start_time,
        shiftRow.split_second_end_time,
      ],
    )
    await recalculateRotaSummary(context)
    await markRotaDraftDirtyIfNeeded(context)

    return mapShiftRowToWorkspaceShift(
      insertResult.rows[0],
      context.days
    )
  })

const assignRotaShiftEmployee = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    assignRotaShiftEmployeeInputSchema.parse(input)
  )
  .handler(async ({ data }): Promise<WorkspaceAssignmentMutationResult> => {
    const context = await getManagedRotaContext(data.rotaId)
    const targetShift = await getWorkingShiftOrThrow(context, data.shiftId)
    await assertEmployeeAssignedToLocation(context, data.employeeId)

    const duplicateResult = await context.supabase
      .from("rota_shift_assignments")
      .select("id")
      .eq("rota_shift_id", data.shiftId)
      .eq("employee_id", data.employeeId)
      .maybeSingle()

    assertSupabaseSuccess(
      duplicateResult.error,
      "We could not check the current shift assignments."
    )

    if (duplicateResult.data) {
      return { status: "noop" }
    }

    const overlap = await getAssignmentOverlapResult({
      context,
      employeeId: data.employeeId,
      targetShift,
    })

    if (overlap) {
      return overlap
    }

    const insertResult = await context.supabase
      .from("rota_shift_assignments")
      .insert({
        employee_id: data.employeeId,
        rota_shift_id: data.shiftId,
      })

    assertSupabaseSuccess(
      insertResult.error,
      "We could not assign that team member to the shift."
    )

    await recalculateRotaSummary(context)
    await markRotaDraftDirtyIfNeeded(context)

    return { status: "success" }
  })

const moveRotaShiftAssignment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    moveRotaShiftAssignmentInputSchema.parse(input)
  )
  .handler(async ({ data }): Promise<WorkspaceAssignmentMutationResult> => {
    const context = await getManagedRotaContext(data.rotaId)
    const assignment = await getWorkingAssignmentOrThrow(context, data.assignmentId)

    if (assignment.shiftId === data.shiftId) {
      return { status: "noop" }
    }

    const targetShift = await getWorkingShiftOrThrow(context, data.shiftId)
    const duplicateResult = await context.supabase
      .from("rota_shift_assignments")
      .select("id")
      .eq("rota_shift_id", data.shiftId)
      .eq("employee_id", assignment.employeeId)
      .maybeSingle()

    assertSupabaseSuccess(
      duplicateResult.error,
      "We could not check the destination shift assignments."
    )

    if (duplicateResult.data) {
      return { status: "noop" }
    }

    const overlap = await getAssignmentOverlapResult({
      context,
      employeeId: assignment.employeeId,
      targetShift,
      excludeAssignmentId: assignment.id,
    })

    if (overlap) {
      return overlap
    }

    const updateResult = await context.supabase
      .from("rota_shift_assignments")
      .update({
        rota_shift_id: data.shiftId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.assignmentId)

    assertSupabaseSuccess(
      updateResult.error,
      "We could not move that team member to the new shift."
    )

    await recalculateRotaSummary(context)
    await markRotaDraftDirtyIfNeeded(context)

    return { status: "success" }
  })

const removeRotaShiftAssignment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    removeRotaShiftAssignmentInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const context = await getManagedRotaContext(data.rotaId)
    await getWorkingAssignmentOrThrow(context, data.assignmentId)

    const deleteResult = await context.supabase
      .from("rota_shift_assignments")
      .delete()
      .eq("id", data.assignmentId)

    assertSupabaseSuccess(
      deleteResult.error,
      "We could not remove that team member from the shift."
    )

    await recalculateRotaSummary(context)
    await markRotaDraftDirtyIfNeeded(context)

    return { success: true }
  })

const copyRotaBoard = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => copyRotaBoardInputSchema.parse(input))
  .handler(async ({ data }): Promise<CopyRotaBoardResult> => {
    const context = await getManagedRotaContext(data.rotaId)

    if (context.rota.status !== "draft") {
      throw new Error("Only draft rotas can be overwritten right now.")
    }

    const sourceRotaQuery = context.supabase
      .from("rotas")
      .select("id, week_start, note")
      .eq("location_id", context.location.id)
      .lt("week_start", context.rota.week_start)
      .order("week_start", { ascending: false })
      .limit(1)
    const sourceRotaResult = await (context.organizationId
      ? sourceRotaQuery.eq("organization_id", context.organizationId)
      : sourceRotaQuery.is("organization_id", null)).maybeSingle()

    assertSupabaseSuccess(
      sourceRotaResult.error,
      "We could not load the previous rota for copying."
    )

    const sourceRota = sourceRotaResult.data

    if (!sourceRota) {
      return {
        status: "unavailable",
        mode: data.mode,
        reason: "no-source",
      }
    }

    const sourceEmployeesQuery = context.supabase
      .from("employees")
      .select("id, full_name, status")
    const locationAssignmentsQuery = context.supabase
      .from("employee_location_assignments")
      .select("employee_id")
      .eq("location_id", context.location.id)
      .eq("is_enabled", true)
      .is("disabled_at", null)
    const [sourceShiftsResult, sourceAssignmentsResult, sourceEmployeesResult, locationAssignmentsResult] =
      await Promise.all([
        context.supabase
          .from("rota_shifts")
          .select(
            "id, day_date, zone_id, zone_name_snapshot, shift_type, start_time, end_time, end_kind, split_second_start_time, split_second_end_time"
          )
          .eq("rota_id", sourceRota.id)
          .order("day_date", { ascending: true })
          .order("start_time", { ascending: true }),
        context.supabase
          .from("rota_shift_assignments")
          .select("employee_id, rota_shift_id")
          .in(
            "rota_shift_id",
            (
              await context.supabase
                .from("rota_shifts")
                .select("id")
                .eq("rota_id", sourceRota.id)
            ).data?.map((shift) => shift.id) ?? ["00000000-0000-0000-0000-000000000000"]
          ),
        context.organizationId
          ? sourceEmployeesQuery.eq("organization_id", context.organizationId)
          : sourceEmployeesQuery.is("organization_id", null),
        context.organizationId
          ? locationAssignmentsQuery.eq("organization_id", context.organizationId)
          : locationAssignmentsQuery.is("organization_id", null),
      ])

    assertSupabaseSuccess(
      sourceShiftsResult.error,
      "We could not load the source rota shifts."
    )
    assertSupabaseSuccess(
      sourceAssignmentsResult.error,
      "We could not load the source rota assignments."
    )
    assertSupabaseSuccess(
      sourceEmployeesResult.error,
      "We could not verify the source team members."
    )
    assertSupabaseSuccess(
      locationAssignmentsResult.error,
      "We could not verify team members for this location."
    )

    const employeeById = new Map(
      (sourceEmployeesResult.data ?? []).map((employee) => [employee.id, employee]),
    )
    const validLocationEmployeeIds = new Set(
      (locationAssignmentsResult.data ?? []).map((assignment) => assignment.employee_id)
    )
    const skippedEmployees = new Map<
      string,
      {
        employeeId: string
        employeeName: string
        reason: "missing" | "inactive" | "not-assigned"
      }
    >()

    const copiedAssignmentRows =
      data.mode === "full"
        ? (sourceAssignmentsResult.data ?? []).filter((assignment) => {
            const employee = employeeById.get(assignment.employee_id)

            if (!employee) {
              skippedEmployees.set(assignment.employee_id, {
                employeeId: assignment.employee_id,
                employeeName: "Unknown team member",
                reason: "missing",
              })
              return false
            }

            if (employee.status !== "active") {
              skippedEmployees.set(employee.id, {
                employeeId: employee.id,
                employeeName: employee.full_name,
                reason: "inactive",
              })
              return false
            }

            if (!validLocationEmployeeIds.has(employee.id)) {
              skippedEmployees.set(employee.id, {
                employeeId: employee.id,
                employeeName: employee.full_name,
                reason: "not-assigned",
              })
              return false
            }

            return true
          })
        : []

    const database = getDatabase()
    const client = await database.connect()

    try {
      await client.query("BEGIN")

      await client.query(
        `delete from public.rota_shift_assignments
         where rota_shift_id in (
           select id from public.rota_shifts where rota_id = $1
         )`,
        [context.rota.id]
      )
      await client.query(`delete from public.rota_shifts where rota_id = $1`, [
        context.rota.id,
      ])

      const shiftIdBySourceId = new Map<string, string>()

      for (const shift of sourceShiftsResult.data ?? []) {
        const normalizedDayDate = shift.day_date
        const dayOffset = differenceInCalendarDays(
          toDateValue(shift.day_date),
          toDateValue(sourceRota.week_start)
        )
        const insertedShift = await client.query<{ id: string }>(
          `insert into public.rota_shifts (
             rota_id,
             organization_id,
             day_date,
             zone_id,
             zone_name_snapshot,
             shift_type,
             start_time,
             end_time,
             end_kind,
             split_second_start_time,
             split_second_end_time
           ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           returning id`,
          [
            context.rota.id,
            context.organizationId,
            buildShiftCopyDayDate(context.rota.week_start, dayOffset, normalizedDayDate),
            shift.zone_id,
            shift.zone_name_snapshot,
            shift.shift_type,
            shift.start_time,
            shift.end_time,
            shift.end_kind,
            shift.split_second_start_time,
            shift.split_second_end_time,
          ]
        )

        shiftIdBySourceId.set(shift.id, insertedShift.rows[0].id)
      }

      for (const assignment of copiedAssignmentRows) {
        const targetShiftId = shiftIdBySourceId.get(assignment.rota_shift_id)

        if (!targetShiftId) {
          continue
        }

        await client.query(
          `insert into public.rota_shift_assignments (
             rota_shift_id,
             employee_id
           ) values ($1, $2)`,
          [targetShiftId, assignment.employee_id]
        )
      }

      await client.query(
        `update public.rotas
         set note = $2,
             updated_at = $3
         where id = $1`,
        [
          context.rota.id,
          data.mode === "full" ? sourceRota.note : context.rota.note ?? null,
          new Date().toISOString(),
        ]
      )

      await recalculateRotaSummaryWithClient(context, client)
      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }

    return {
      status: "success",
      mode: data.mode,
      overwritten: true,
      sourceWeekLabel: buildWeekLabel(sourceRota.week_start),
      copiedShiftCount: sourceShiftsResult.data?.length ?? 0,
      copiedAssignmentCount: copiedAssignmentRows.length,
      copiedNote: data.mode === "full",
      skippedEmployees: Array.from(skippedEmployees.values()),
    }
  })

async function getManagedRotaContext(rotaId: string) {
  const context = await requireRotaWriteAccess({
    rotaId,
    permission: "update",
    errorMessage: "You do not have permission to edit this rota.",
  })
  const database = getDatabase()
  const hoursResult = await database.query<{
    close_time: string
    close_time_next_day: boolean
    weekday: number
  }>(
    `select weekday, close_time, close_time_next_day
     from public.location_operating_hours
     where location_id = $1
       and (
         ($2::text is null and organization_id is null)
         or organization_id = $2::text
       )`,
    [context.location.id, context.organizationId]
  )
  const estimatedClosingTimeResult = await database.query<{
    estimated_closing_time: string
    estimated_closing_time_next_day: boolean
  }>(
    `select estimated_closing_time, estimated_closing_time_next_day
     from public.locations
     where id = $1
     limit 1`,
    [context.location.id]
  )

  const days = buildWorkspaceDays(context.rota.week_start)
  const workspaceLocation = buildWorkspaceLocation(
    {
      ...context.location,
      estimatedClosingTime:
        estimatedClosingTimeResult.rows[0]?.estimated_closing_time ?? "23:00",
      estimatedClosingTimeNextDay:
        estimatedClosingTimeResult.rows[0]?.estimated_closing_time_next_day ??
        false,
    },
    days,
    hoursResult.rows
  )

  return {
    days,
    location: context.location,
    organizationId: context.organizationId,
    rota: context.rota,
    supabase: context.supabase,
    userId: context.userId,
    workspaceLocation,
  }
}

function buildShiftCopyDayDate(
  targetWeekStart: string | Date,
  dayOffset: number,
  fallbackDayDate: string | Date
) {
  if (dayOffset < 0 || dayOffset > 6) {
    return toIsoDateValue(fallbackDayDate)
  }

  return format(addDays(toDateValue(targetWeekStart), dayOffset), "yyyy-MM-dd")
}

function toDateValue(value: string | Date) {
  return value instanceof Date ? value : parseISO(value)
}

function toIsoDateValue(value: string | Date) {
  return format(toDateValue(value), "yyyy-MM-dd")
}

async function getZoneForLocationOrThrow(
  locationId: string,
  organizationId: string | null,
  zoneId: string
) {
  const supabase = createSupabaseServerClient()
  const zoneQuery = supabase
    .from("zones")
    .select("id, name")
    .eq("location_id", locationId)
    .eq("id", zoneId)
    .is("deleted_at", null)
  const zoneResult = await (organizationId
    ? zoneQuery.eq("organization_id", organizationId)
    : zoneQuery.is("organization_id", null)).maybeSingle()

  assertSupabaseSuccess(zoneResult.error, "Choose a valid zone.")

  if (!zoneResult.data) {
    throw new Error("Choose a valid zone.")
  }

  return zoneResult.data
}

async function assertEmployeeAssignedToLocation(
  context: Awaited<ReturnType<typeof getManagedRotaContext>>,
  employeeId: string
) {
  const assignmentQuery = context.supabase
    .from("employee_location_assignments")
    .select("employee_id")
    .eq("location_id", context.location.id)
    .eq("employee_id", employeeId)
    .eq("is_enabled", true)
    .is("disabled_at", null)
  const assignmentResult = await (context.organizationId
    ? assignmentQuery.eq("organization_id", context.organizationId)
    : assignmentQuery.is("organization_id", null)).maybeSingle()

  assertSupabaseSuccess(
    assignmentResult.error,
    "We could not confirm that team member for this location."
  )

  if (!assignmentResult.data) {
    throw new Error("That team member is not assigned to this location.")
  }
}

async function getWorkingShiftOrThrow(
  context: Awaited<ReturnType<typeof getManagedRotaContext>>,
  shiftId: string
) {
  const shiftResult = await context.supabase
    .from("rota_shifts")
    .select(
      "id, day_date, zone_id, zone_name_snapshot, shift_type, start_time, end_time, end_kind, split_second_start_time, split_second_end_time"
    )
    .eq("rota_id", context.rota.id)
    .eq("id", shiftId)
    .maybeSingle()

  assertSupabaseSuccess(shiftResult.error, "That shift could not be found.")

  return mapShiftRowToWorkspaceShift(
    getRequiredSupabaseRow(shiftResult.data, "That shift could not be found."),
    context.days
  )
}

async function getWorkingAssignmentOrThrow(
  context: Awaited<ReturnType<typeof getManagedRotaContext>>,
  assignmentId: string
) {
  const assignmentResult = await context.supabase
    .from("rota_shift_assignments")
    .select("id, employee_id, rota_shift_id")
    .eq("id", assignmentId)
    .maybeSingle()

  assertSupabaseSuccess(
    assignmentResult.error,
    "That shift assignment could not be found."
  )
  const assignment = getRequiredSupabaseRow(
    assignmentResult.data,
    "That shift assignment could not be found."
  )
  const shiftResult = await context.supabase
    .from("rota_shifts")
    .select("rota_id")
    .eq("id", assignment.rota_shift_id)
    .maybeSingle()

  assertSupabaseSuccess(shiftResult.error, "That shift assignment is not valid anymore.")

  if (!shiftResult.data || shiftResult.data.rota_id !== context.rota.id) {
    throw new Error("That shift assignment is not valid anymore.")
  }

  return {
    id: assignment.id,
    employeeId: assignment.employee_id,
    shiftId: assignment.rota_shift_id,
  }
}

async function getAssignmentOverlapResult({
  context,
  employeeId,
  targetShift,
  excludeAssignmentId,
}: {
  context: Awaited<ReturnType<typeof getManagedRotaContext>>
  employeeId: string
  targetShift: WorkspaceShift
  excludeAssignmentId?: string
}): Promise<WorkspaceAssignmentMutationResult | null> {
  const employeeQuery = context.supabase
    .from("employees")
    .select("full_name")
    .eq("id", employeeId)
  const zonesQuery = context.supabase
    .from("zones")
    .select("id, name")
    .eq("location_id", context.location.id)
    .is("deleted_at", null)
  const [employeeResult, zonesResult, shiftsResult, assignmentsResult] = await Promise.all([
    (context.organizationId
      ? employeeQuery.eq("organization_id", context.organizationId)
      : employeeQuery.is("organization_id", null)).maybeSingle(),
    context.organizationId
      ? zonesQuery.eq("organization_id", context.organizationId)
      : zonesQuery.is("organization_id", null),
    context.supabase
      .from("rota_shifts")
      .select(
        "id, day_date, zone_id, zone_name_snapshot, shift_type, start_time, end_time, end_kind, split_second_start_time, split_second_end_time"
      )
      .eq("rota_id", context.rota.id),
    context.supabase
      .from("rota_shift_assignments")
      .select("id, employee_id, rota_shift_id")
      .eq("employee_id", employeeId),
  ])

  assertSupabaseSuccess(employeeResult.error, "We could not load that team member.")
  assertSupabaseSuccess(zonesResult.error, "We could not load the rota zones.")
  assertSupabaseSuccess(shiftsResult.error, "We could not load the saved shifts.")
  assertSupabaseSuccess(
    assignmentsResult.error,
    "We could not check existing employee assignments."
  )

  const shiftsById = (shiftsResult.data ?? []).reduce<Record<string, WorkspaceShift>>(
    (map, row) => {
      map[row.id] = mapShiftRowToWorkspaceShift(row, context.days)
      return map
    },
    {}
  )

  const overlappingAssignment = (assignmentsResult.data ?? []).find((assignment) => {
    if (excludeAssignmentId && assignment.id === excludeAssignmentId) {
      return false
    }

    const existingShift = shiftsById[assignment.rota_shift_id]

    if (!existingShift) {
      return false
    }

    const existingSegments = getShiftAbsoluteSegments(existingShift, {
      days: context.days,
      location: context.workspaceLocation,
    })
    const nextSegments = getShiftAbsoluteSegments(targetShift, {
      days: context.days,
      location: context.workspaceLocation,
    })

    return existingSegments.some((existingSegment) =>
      nextSegments.some(
        (nextSegment) =>
          existingSegment.startMinutes < nextSegment.endMinutes &&
          nextSegment.startMinutes < existingSegment.endMinutes
      )
    )
  })

  if (!overlappingAssignment) {
    return null
  }

  const targetDay = context.days.find((day) => day.id === targetShift.dayId)
  const targetZone =
    (zonesResult.data ?? []).find((zone) => zone.id === targetShift.zoneId)?.name ??
    targetShift.zoneName ??
    "this zone"

  return {
    status: "overlap",
    employeeName: employeeResult.data?.full_name ?? "This team member",
    dayLabel: targetDay?.shortLabel ?? "that day",
    zoneName: targetZone,
  }
}

async function recalculateRotaSummary(
  context: Awaited<ReturnType<typeof getManagedRotaContext>>
) {
  const [shiftsResult, assignmentsResult] = await Promise.all([
    context.supabase
      .from("rota_shifts")
      .select(
        "id, day_date, zone_id, zone_name_snapshot, shift_type, start_time, end_time, end_kind, split_second_start_time, split_second_end_time"
      )
      .eq("rota_id", context.rota.id),
    context.supabase
      .from("rota_shift_assignments")
      .select("id, employee_id, rota_shift_id"),
  ])

  assertSupabaseSuccess(shiftsResult.error, "We could not refresh the rota summary.")
  assertSupabaseSuccess(
    assignmentsResult.error,
    "We could not refresh the rota summary."
  )

  const shiftsById = (shiftsResult.data ?? []).reduce<Record<string, WorkspaceShift>>(
    (map, row) => {
      map[row.id] = mapShiftRowToWorkspaceShift(row, context.days)
      return map
    },
    {}
  )
  const assignments = (assignmentsResult.data ?? [])
    .filter((assignment) => assignment.rota_shift_id in shiftsById)
    .map(
      (assignment) =>
        ({
          id: assignment.id,
          employeeId: assignment.employee_id,
          shiftId: assignment.rota_shift_id,
        }) satisfies WorkspaceAssignment
    )
  const uniqueEmployeeIds = new Set(assignments.map((assignment) => assignment.employeeId))
  const totalMinutes = assignments.reduce((sum, assignment) => {
    const shift = shiftsById[assignment.shiftId]
    return shift
      ? sum + getShiftDurationMinutes(shift, context.workspaceLocation)
      : sum
  }, 0)

  const updateResult = await context.supabase
    .from("rotas")
    .update({
      scheduled_hours: totalMinutes / 60,
      scheduled_staff_count: uniqueEmployeeIds.size,
      shift_count: Object.keys(shiftsById).length,
      updated_at: new Date().toISOString(),
    })
    .eq("id", context.rota.id)

  assertSupabaseSuccess(updateResult.error, "We could not refresh the rota summary.")
}

async function recalculateRotaSummaryWithClient(
  context: Awaited<ReturnType<typeof getManagedRotaContext>>,
  client: PoolClient
) {
  const shiftsResult = await client.query<{
    day_date: string
    end_kind: string | null
    end_time: string | null
    id: string
    shift_type: string
    split_second_end_time: string | null
    split_second_start_time: string | null
    start_time: string
    zone_id: string | null
    zone_name_snapshot: string
  }>(
    `select
       id,
       day_date,
       zone_id,
       zone_name_snapshot,
       shift_type,
       start_time,
       end_time,
       end_kind,
       split_second_start_time,
       split_second_end_time
     from public.rota_shifts
     where rota_id = $1`,
    [context.rota.id]
  )
  const assignmentsResult = await client.query<{
    employee_id: string
    id: string
    rota_shift_id: string
  }>(
    `select id, employee_id, rota_shift_id
     from public.rota_shift_assignments
     where rota_shift_id in (
       select id from public.rota_shifts where rota_id = $1
     )`,
    [context.rota.id]
  )

  const shiftsById = shiftsResult.rows.reduce<Record<string, WorkspaceShift>>(
    (map, row) => {
      map[row.id] = mapShiftRowToWorkspaceShift(row, context.days)
      return map
    },
    {}
  )
  const assignments = assignmentsResult.rows.map(
    (assignment) =>
      ({
        id: assignment.id,
        employeeId: assignment.employee_id,
        shiftId: assignment.rota_shift_id,
      }) satisfies WorkspaceAssignment
  )
  const uniqueEmployeeIds = new Set(assignments.map((assignment) => assignment.employeeId))
  const totalMinutes = assignments.reduce((sum, assignment) => {
    const shift = shiftsById[assignment.shiftId]
    return shift
      ? sum + getShiftDurationMinutes(shift, context.workspaceLocation)
      : sum
  }, 0)

  await client.query(
    `update public.rotas
     set scheduled_hours = $2,
         scheduled_staff_count = $3,
         shift_count = $4,
         updated_at = $5
     where id = $1`,
    [
      context.rota.id,
      totalMinutes / 60,
      uniqueEmployeeIds.size,
      Object.keys(shiftsById).length,
      new Date().toISOString(),
    ]
  )
}

async function listValidEmployeeIdsForLocation(
  context: Awaited<ReturnType<typeof getManagedRotaContext>>
) {
  const query = context.supabase
    .from("employee_location_assignments")
    .select("employee_id")
    .eq("location_id", context.location.id)
    .eq("is_enabled", true)
    .is("disabled_at", null)
  const result = await (context.organizationId
    ? query.eq("organization_id", context.organizationId)
    : query.is("organization_id", null))

  assertSupabaseSuccess(
    result.error,
    "We could not confirm the team members for this location."
  )

  return new Set((result.data ?? []).map((entry) => entry.employee_id))
}

async function getZoneSnapshotById(
  context: Awaited<ReturnType<typeof getManagedRotaContext>>
) {
  const query = context.supabase
    .from("zones")
    .select("id, name")
    .eq("location_id", context.location.id)
    .is("deleted_at", null)
  const result = await (context.organizationId
    ? query.eq("organization_id", context.organizationId)
    : query.is("organization_id", null))

  assertSupabaseSuccess(result.error, "We could not load the rota zones.")

  return new Map((result.data ?? []).map((zone) => [zone.id, zone.name]))
}

function resolveZoneSnapshot({
  shift,
  zoneSnapshotById,
}: {
  shift: {
    zoneId: string
    zoneName?: string
  }
  zoneSnapshotById: Map<string, string>
}) {
  const liveZoneName = zoneSnapshotById.get(shift.zoneId)

  if (liveZoneName) {
    return {
      zoneId: shift.zoneId,
      zoneName: liveZoneName,
    }
  }

  if (shift.zoneName) {
    return {
      zoneId: null,
      zoneName: shift.zoneName,
    }
  }

  throw new Error(
    "One or more shifts use a zone that no longer exists. Choose a new zone before saving.",
  )
}

function toCreateWorkspaceShiftInput(
  shift: {
    dayId: string
    zoneId: string | null
    zoneName?: string
    shiftType: "standard" | "closing" | "split"
    startTime?: string
    endTime?: string
    endKind?: "locationClose"
      segments?: [
        {
          startTime: string
          endTime: string
        },
        (
          | {
              startTime: string
              endTime: string
            }
          | {
              startTime: string
              endKind: "locationClose"
            }
        ),
      ]
  }
): CreateWorkspaceShiftInput {
  if (shift.shiftType === "standard") {
    return {
      dayId: shift.dayId,
      zoneId: shift.zoneId ?? "",
      zoneName: shift.zoneName,
      shiftType: "standard",
      startTime: shift.startTime ?? "00:00",
      endTime: shift.endTime ?? "00:00",
    }
  }

  if (shift.shiftType === "closing") {
    return {
      dayId: shift.dayId,
      zoneId: shift.zoneId ?? "",
      zoneName: shift.zoneName,
      shiftType: "closing",
      startTime: shift.startTime ?? "00:00",
      endKind: "locationClose",
    }
  }

  return {
    dayId: shift.dayId,
    zoneId: shift.zoneId ?? "",
    zoneName: shift.zoneName,
    shiftType: "split",
    segments: shift.segments ?? [
      {
        startTime: "00:00",
        endTime: "00:15",
      },
      {
        startTime: "00:30",
        endTime: "00:45",
      },
    ],
  }
}

async function markRotaDraftDirtyIfNeeded(
  context: Awaited<ReturnType<typeof getManagedRotaContext>>
) {
  if (context.rota.status !== "published") {
    return
  }

  const updateResult = await context.supabase
    .from("rotas")
    .update({
      has_unpublished_changes: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", context.rota.id)

  assertSupabaseSuccess(
    updateResult.error,
    "We could not update the rota publish status."
  )
}

async function markRotaDraftDirtyIfNeededWithClient(
  context: Awaited<ReturnType<typeof getManagedRotaContext>>,
  client: PoolClient
) {
  if (context.rota.status !== "published") {
    return
  }

  await client.query(
    `update public.rotas
     set has_unpublished_changes = true,
         updated_at = $2
     where id = $1`,
    [context.rota.id, new Date().toISOString()]
  )
}

export {
  assignRotaShiftEmployee,
  copyRotaBoard,
  createRotaShift,
  moveRotaShiftAssignment,
  removeRotaShiftAssignment,
  saveRotaWorkspace,
}
