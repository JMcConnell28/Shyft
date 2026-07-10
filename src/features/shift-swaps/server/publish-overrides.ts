import type { Pool } from "pg"

type ApprovedShiftSwapOverrideRow = {
  accepted_response_id: string | null
  request_type: "swap" | "cover"
  requester_employee_id: string
  responder_employee_id: string | null
  source_working_shift_id: string | null
  target_employee_id: string | null
  target_working_shift_id: string | null
}

type ReapplyApprovedShiftSwapOverridesInput = {
  database: Pool
  publishedShiftIdByWorkingShiftId: Map<string, string>
  rotaId: string
}

async function reapplyApprovedShiftSwapOverrides({
  database,
  publishedShiftIdByWorkingShiftId,
  rotaId,
}: ReapplyApprovedShiftSwapOverridesInput) {
  if (publishedShiftIdByWorkingShiftId.size === 0) {
    return
  }

  const result = await database.query<ApprovedShiftSwapOverrideRow>(
    `select request.request_type,
            request.requester_employee_id,
            request.target_employee_id,
            request.source_working_shift_id,
            request.target_working_shift_id,
            request.accepted_response_id,
            response.responder_employee_id
     from public.shift_swap_requests request
     left join public.shift_swap_responses response
       on response.id = request.accepted_response_id
     where request.rota_id = $1::uuid
       and request.status = 'approved'
     order by request.approved_at asc nulls last, request.created_at asc`,
    [rotaId]
  )

  for (const override of result.rows) {
    const sourcePublishedShiftId = override.source_working_shift_id
      ? publishedShiftIdByWorkingShiftId.get(override.source_working_shift_id)
      : undefined

    if (!sourcePublishedShiftId) {
      continue
    }

    if (override.request_type === "cover") {
      if (!override.responder_employee_id) {
        continue
      }

      await updatePublishedAssignmentEmployee({
        database,
        expectedEmployeeId: override.requester_employee_id,
        nextEmployeeId: override.responder_employee_id,
        publishedShiftId: sourcePublishedShiftId,
      })
      continue
    }

    const targetPublishedShiftId = override.target_working_shift_id
      ? publishedShiftIdByWorkingShiftId.get(override.target_working_shift_id)
      : undefined

    if (!targetPublishedShiftId || !override.target_employee_id) {
      continue
    }

    await updatePublishedAssignmentEmployee({
      database,
      expectedEmployeeId: override.requester_employee_id,
      nextEmployeeId: override.target_employee_id,
      publishedShiftId: sourcePublishedShiftId,
    })
    await updatePublishedAssignmentEmployee({
      database,
      expectedEmployeeId: override.target_employee_id,
      nextEmployeeId: override.requester_employee_id,
      publishedShiftId: targetPublishedShiftId,
    })
  }
}

async function updatePublishedAssignmentEmployee({
  database,
  expectedEmployeeId,
  nextEmployeeId,
  publishedShiftId,
}: {
  database: Pool
  expectedEmployeeId: string
  nextEmployeeId: string
  publishedShiftId: string
}) {
  await database.query(
    `update public.rota_published_shift_assignments
     set employee_id = $3::uuid,
         updated_at = timezone('utc', now())
     where rota_published_shift_id = $1::uuid
       and employee_id = $2::uuid`,
    [publishedShiftId, expectedEmployeeId, nextEmployeeId]
  )
}

export { reapplyApprovedShiftSwapOverrides }
