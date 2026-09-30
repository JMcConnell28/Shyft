import type {
  WorkspaceAssignment,
  WorkspaceDay,
  WorkspaceShift,
} from "@/features/rota/types/workspace"
import type { createSupabaseServerClient } from "@/lib/supabase.server"
import { mapShiftRowToWorkspaceShift } from "@/features/rota/server/workspace-shared"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>

async function loadWorkspaceShifts(
  supabase: SupabaseServerClient,
  rotaId: string,
  days: Array<WorkspaceDay>,
  publishedOnly: boolean
): Promise<Array<WorkspaceShift>> {
  const columns =
    "id, day_date, zone_id, zone_name_snapshot, shift_type, start_time, end_time, end_kind, split_second_start_time, split_second_end_time"
  const result = publishedOnly
    ? await supabase
        .from("rota_published_shifts")
        .select(columns)
        .eq("rota_id", rotaId)
        .order("day_date", { ascending: true })
        .order("start_time", { ascending: true })
    : await supabase
        .from("rota_shifts")
        .select(columns)
        .eq("rota_id", rotaId)
        .order("day_date", { ascending: true })
        .order("start_time", { ascending: true })

  assertSupabaseSuccess(result.error, "We could not load the saved shifts.")

  return (result.data ?? []).map((row) =>
    mapShiftRowToWorkspaceShift(row, days)
  )
}

async function loadWorkspaceAssignments(
  supabase: SupabaseServerClient,
  shifts: Array<WorkspaceShift>,
  publishedOnly: boolean
): Promise<Array<WorkspaceAssignment>> {
  const shiftIds = shifts.map((shift) => shift.id)

  if (shiftIds.length === 0) {
    return []
  }

  if (publishedOnly) {
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

export { loadWorkspaceAssignments, loadWorkspaceShifts }
