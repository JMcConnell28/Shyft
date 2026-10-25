import { listPublishedShiftRows } from "./shared"
// eslint-disable-next-line no-duplicate-imports
import type { PublishedShiftRow, ShiftSwapContext } from "./shared"

async function getRequestShiftsOrThrow(
  context: ShiftSwapContext,
  request: { source_assignment_id: string; target_assignment_id: string | null }
): Promise<{ source: PublishedShiftRow; target: PublishedShiftRow | null }> {
  const shifts = await listPublishedShiftRows(context)
  const source = shifts.find(
    (shift) => shift.assignment_id === request.source_assignment_id
  )
  const target = request.target_assignment_id
    ? shifts.find(
        (shift) => shift.assignment_id === request.target_assignment_id
      )
    : null
  if (!source || (request.target_assignment_id && !target)) {
    throw new Error("Choose a valid current or future published shift.")
  }
  return { source, target: target ?? null }
}

export { getRequestShiftsOrThrow }
