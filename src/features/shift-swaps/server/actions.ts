import type { PoolClient } from "pg"

import { requireRotaWriteAccess } from "@/features/rota/server/write-access"
import {
  getShiftSwapContext,
  hasShiftOverlap,
  hasTimeEntryForShift,
  listPublishedShiftRows,
  listUserEmployees,
  type PublishedShiftRow,
  type ShiftSwapScopeInput,
} from "@/features/shift-swaps/server/shared"
import {
  getShiftSwapCutoffAt,
  hasCompatibleStaffGroup,
  isPastShiftSwapCutoff,
} from "@/features/shift-swaps/utils/shift-swap-rules"
import { getDatabase } from "@/lib/db"

async function runShiftSwapTransaction<T>(
  action: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getDatabase().connect()

  try {
    await client.query("BEGIN")
    const result = await action(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

async function createCoverRequest(
  input: ShiftSwapScopeInput & {
    sourceAssignmentId: string
  }
) {
  const context = await getShiftSwapContext(input)
  const source = await getOwnedShiftOrThrow(context, input.sourceAssignmentId)
  await assertNoActiveSourceRequest(input.sourceAssignmentId)

  await getDatabase().query(
    `insert into public.shift_swap_requests (
       request_type,
       status,
       rota_id,
       location_id,
       source_published_shift_id,
       source_assignment_id,
       source_working_shift_id,
       requester_employee_id,
       requester_user_id,
       cutoff_at
     ) values ('cover', 'open', $1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      source.rota_id,
      source.location_id,
      source.published_shift_id,
      source.assignment_id,
      source.working_shift_id,
      source.employee_id,
      context.userId,
      getShiftSwapCutoffAt(new Date(source.starts_at)).toISOString(),
    ]
  )

  return { success: true }
}

async function createSwapRequest(
  input: ShiftSwapScopeInput & {
    sourceAssignmentId: string
    targetAssignmentId: string
  }
) {
  const context = await getShiftSwapContext(input)
  const source = await getOwnedShiftOrThrow(context, input.sourceAssignmentId)
  const target = await getShiftByAssignmentOrThrow(
    context,
    input.targetAssignmentId
  )

  if (source.assignment_id === target.assignment_id) {
    throw new Error("Choose a different shift to swap with.")
  }

  if (!target.employee_user_id) {
    throw new Error("That team member cannot receive app swap requests yet.")
  }

  assertSameRole(source, target)
  await assertNoActiveSourceRequest(input.sourceAssignmentId)
  await assertSwapAvailability(context, source, target)

  const client = await getDatabase().connect()

  try {
    await client.query("BEGIN")
    const requestResult = await client.query<{ id: string }>(
      `insert into public.shift_swap_requests (
         request_type,
         status,
         rota_id,
         location_id,
         source_published_shift_id,
         source_assignment_id,
         source_working_shift_id,
         requester_employee_id,
         requester_user_id,
         target_employee_id,
         target_published_shift_id,
         target_assignment_id,
         target_working_shift_id,
         cutoff_at
       ) values ('swap', 'awaiting_peer', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       returning id`,
      [
        source.rota_id,
        source.location_id,
        source.published_shift_id,
        source.assignment_id,
        source.working_shift_id,
        source.employee_id,
        context.userId,
        target.employee_id,
        target.published_shift_id,
        target.assignment_id,
        target.working_shift_id,
        getShiftSwapCutoffAt(new Date(source.starts_at)).toISOString(),
      ]
    )
    const requestId = requestResult.rows[0]?.id

    if (!requestId) {
      throw new Error("We could not create that shift swap.")
    }

    await client.query(
      `insert into public.shift_swap_responses (
         request_id,
         responder_employee_id,
         responder_user_id,
         responder_assignment_id
       ) values ($1, $2, (
         select user_id from public.employees where id = $2::uuid
       ), $3)`,
      [requestId, target.employee_id, target.assignment_id]
    )
    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }

  return { success: true }
}

async function respondToSwapRequest(
  input: ShiftSwapScopeInput & {
    requestId: string
    decision: "accept" | "decline"
  }
) {
  const context = await getShiftSwapContext(input)
  const request = await getRequestForAction(input.requestId)
  const response = await getPendingResponseForUser(
    input.requestId,
    context.userId
  )

  assertRequestBeforeCutoff(request)

  if (request.request_type !== "swap" || request.status !== "awaiting_peer") {
    throw new Error("That swap request is no longer waiting for a response.")
  }

  if (input.decision === "decline") {
    await runShiftSwapTransaction(async (client) => {
      await client.query(
        `update public.shift_swap_requests
         set status = 'denied',
             denied_at = timezone('utc', now()),
             updated_at = timezone('utc', now())
         where id = $1`,
        [input.requestId]
      )
      await client.query(
        `update public.shift_swap_responses
         set status = 'declined',
             responded_at = timezone('utc', now()),
             updated_at = timezone('utc', now())
         where id = $1`,
        [response.id]
      )
    })

    return { success: true }
  }

  const source = await getShiftByAssignmentOrThrow(
    context,
    request.source_assignment_id
  )
  const target = await getShiftByAssignmentOrThrow(
    context,
    request.target_assignment_id ?? ""
  )
  await assertSwapAvailability(context, source, target)

  await runShiftSwapTransaction(async (client) => {
    await client.query(
      `update public.shift_swap_responses
       set status = 'accepted',
           responded_at = timezone('utc', now()),
           updated_at = timezone('utc', now())
       where id = $1`,
      [response.id]
    )
    await client.query(
      `update public.shift_swap_requests
       set status = 'pending_manager',
           accepted_response_id = $2,
           updated_at = timezone('utc', now())
       where id = $1`,
      [input.requestId, response.id]
    )
  })

  return { success: true }
}

async function offerCover(
  input: ShiftSwapScopeInput & {
    requestId: string
  }
) {
  const context = await getShiftSwapContext(input)
  const userEmployees = await listUserEmployees(context)
  const request = await getRequestForAction(input.requestId)

  assertRequestBeforeCutoff(request)

  if (request.request_type !== "cover" || request.status !== "open") {
    throw new Error("That cover request is no longer open.")
  }

  const source = await getShiftByAssignmentOrThrow(
    context,
    request.source_assignment_id
  )
  const responder = userEmployees.find(
    (employee) =>
      employee.location_id === source.location_id &&
      employee.id !== source.employee_id &&
      hasCompatibleStaffGroup(employee.staff_group_id, source.staff_group_id)
  )

  if (!responder) {
    throw new Error(
      "Only team members in the same staff group can offer cover."
    )
  }

  await assertEmployeeCanReceiveShift(context, responder.id, source, null)

  const client = await getDatabase().connect()

  try {
    await client.query("BEGIN")
    const responseResult = await client.query<{ id: string }>(
      `insert into public.shift_swap_responses (
         request_id,
         responder_employee_id,
         responder_user_id,
         status,
         responded_at
       ) values ($1, $2, $3, 'accepted', timezone('utc', now()))
       returning id`,
      [input.requestId, responder.id, context.userId]
    )
    const responseId = responseResult.rows[0]?.id

    if (!responseId) {
      throw new Error("We could not offer cover for that shift.")
    }

    const claimResult = await client.query(
      `update public.shift_swap_requests
       set status = 'pending_manager',
           accepted_response_id = $2,
           updated_at = timezone('utc', now())
       where id = $1
         and status = 'open'`,
      [input.requestId, responseId]
    )

    if (claimResult.rowCount !== 1) {
      throw new Error("That cover request has already been claimed.")
    }

    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }

  return { success: true }
}

async function cancelShiftSwapRequest(
  input: ShiftSwapScopeInput & {
    requestId: string
  }
) {
  const context = await getShiftSwapContext(input)
  const request = await getRequestForAction(input.requestId)

  if (request.requester_user_id !== context.userId) {
    throw new Error("Only the requester can cancel this request.")
  }

  if (!["awaiting_peer", "open", "pending_manager"].includes(request.status)) {
    throw new Error("That request can no longer be cancelled.")
  }

  await runShiftSwapTransaction(async (client) => {
    await client.query(
      `update public.shift_swap_requests
       set status = 'cancelled',
           cancelled_at = timezone('utc', now()),
           updated_at = timezone('utc', now())
       where id = $1`,
      [input.requestId]
    )
    await client.query(
      `update public.shift_swap_responses
       set status = case when status in ('pending', 'accepted') then 'withdrawn' else status end,
           updated_at = timezone('utc', now())
       where request_id = $1`,
      [input.requestId]
    )
  })

  return { success: true }
}

async function approveShiftSwapRequest(
  input: ShiftSwapScopeInput & {
    requestId: string
    note?: string
  }
) {
  const request = await getRequestForAction(input.requestId)
  await requireRotaWriteAccess({
    rotaId: request.rota_id,
    permission: "update",
    errorMessage: "You do not have permission to approve shift swaps.",
  })
  assertRequestBeforeCutoff(request)

  if (request.status !== "pending_manager" || !request.accepted_response_id) {
    throw new Error("That request is not waiting for manager approval.")
  }

  const context = await getShiftSwapContext(input)
  const source = await getShiftByAssignmentOrThrow(
    context,
    request.source_assignment_id
  )
  const response = await getAcceptedResponse(request.accepted_response_id)
  const client = await getDatabase().connect()

  try {
    await client.query("BEGIN")

    if (request.request_type === "cover") {
      await assertEmployeeCanReceiveShift(
        context,
        response.responder_employee_id,
        source,
        null
      )
      await assertNoTimeEntriesForApproval(client, [
        [source.employee_id, source.published_shift_id],
        [response.responder_employee_id, source.published_shift_id],
      ])
      await client.query(
        `update public.rota_published_shift_assignments
         set employee_id = $2,
             updated_at = timezone('utc', now())
         where id = $1`,
        [source.assignment_id, response.responder_employee_id]
      )
    } else {
      const target = await getShiftByAssignmentOrThrow(
        context,
        request.target_assignment_id ?? ""
      )
      await assertSwapAvailability(context, source, target)
      await assertNoTimeEntriesForApproval(client, [
        [source.employee_id, source.published_shift_id],
        [target.employee_id, target.published_shift_id],
        [source.employee_id, target.published_shift_id],
        [target.employee_id, source.published_shift_id],
      ])
      await client.query(
        `update public.rota_published_shift_assignments
         set employee_id = case
               when id = $1::uuid then $4::uuid
               when id = $2::uuid then $3::uuid
               else employee_id
             end,
             updated_at = timezone('utc', now())
         where id in ($1::uuid, $2::uuid)`,
        [
          source.assignment_id,
          target.assignment_id,
          source.employee_id,
          target.employee_id,
        ]
      )
    }

    await client.query(
      `update public.shift_swap_requests
       set status = 'approved',
           manager_user_id = $2,
           manager_note = $3,
           approved_at = timezone('utc', now()),
           updated_at = timezone('utc', now())
       where id = $1`,
      [input.requestId, context.userId, input.note?.trim() || null]
    )
    await client.query(
      `update public.shift_swap_responses
       set status = 'approved',
           manager_handled_at = timezone('utc', now()),
           updated_at = timezone('utc', now())
       where id = $1`,
      [request.accepted_response_id]
    )
    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }

  return { success: true }
}

async function denyShiftSwapRequest(
  input: ShiftSwapScopeInput & {
    requestId: string
    note?: string
  }
) {
  const request = await getRequestForAction(input.requestId)
  const context = await getShiftSwapContext(input)
  await requireRotaWriteAccess({
    rotaId: request.rota_id,
    permission: "update",
    errorMessage: "You do not have permission to deny shift swaps.",
  })

  if (request.status !== "pending_manager") {
    throw new Error("That request is not waiting for manager approval.")
  }

  await runShiftSwapTransaction(async (client) => {
    await client.query(
      `update public.shift_swap_requests
       set status = 'denied',
           manager_user_id = $2,
           manager_note = $3,
           denied_at = timezone('utc', now()),
           updated_at = timezone('utc', now())
       where id = $1`,
      [input.requestId, context.userId, input.note?.trim() || null]
    )
    await client.query(
      `update public.shift_swap_responses
       set status = case when id = $2::uuid then 'denied' else status end,
           manager_handled_at = case when id = $2::uuid then timezone('utc', now()) else manager_handled_at end,
           updated_at = timezone('utc', now())
       where request_id = $1`,
      [input.requestId, request.accepted_response_id]
    )
  })

  return { success: true }
}

async function getOwnedShiftOrThrow(
  context: Awaited<ReturnType<typeof getShiftSwapContext>>,
  assignmentId: string
) {
  const userEmployees = await listUserEmployees(context)
  const userEmployeeIds = new Set(userEmployees.map((employee) => employee.id))
  const shift = await getShiftByAssignmentOrThrow(context, assignmentId)

  if (!userEmployeeIds.has(shift.employee_id)) {
    throw new Error("Choose one of your own shifts.")
  }

  assertShiftBeforeCutoff(shift)

  return shift
}

async function getShiftByAssignmentOrThrow(
  context: Awaited<ReturnType<typeof getShiftSwapContext>>,
  assignmentId: string
) {
  const shifts = await listPublishedShiftRows(context)
  const shift = shifts.find((entry) => entry.assignment_id === assignmentId)

  if (!shift) {
    throw new Error("Choose a valid current or future published shift.")
  }

  return shift
}

async function assertNoActiveSourceRequest(sourceAssignmentId: string) {
  const result = await getDatabase().query<{ exists: boolean }>(
    `select exists(
       select 1
       from public.shift_swap_requests
       where source_assignment_id = $1::uuid
         and status in ('awaiting_peer', 'open', 'pending_manager')
     )`,
    [sourceAssignmentId]
  )

  if (result.rows[0]?.exists) {
    throw new Error("That shift already has an active swap or cover request.")
  }
}

function assertSameRole(source: PublishedShiftRow, target: PublishedShiftRow) {
  if (!hasCompatibleStaffGroup(source.staff_group_id, target.staff_group_id)) {
    throw new Error("Choose someone in the same staff group.")
  }
}

async function assertSwapAvailability(
  context: Awaited<ReturnType<typeof getShiftSwapContext>>,
  source: PublishedShiftRow,
  target: PublishedShiftRow
) {
  assertShiftBeforeCutoff(source)
  assertSameRole(source, target)
  await assertEmployeeCanReceiveShift(
    context,
    target.employee_id,
    source,
    target.assignment_id
  )
  await assertEmployeeCanReceiveShift(
    context,
    source.employee_id,
    target,
    source.assignment_id
  )
  await assertNoTimeEntriesForApproval(undefined, [
    [source.employee_id, source.published_shift_id],
    [target.employee_id, target.published_shift_id],
  ])
}

async function assertEmployeeCanReceiveShift(
  context: Awaited<ReturnType<typeof getShiftSwapContext>>,
  employeeId: string,
  shift: PublishedShiftRow,
  excludeAssignmentId: string | null
) {
  const assignedShifts = (await listPublishedShiftRows(context)).filter(
    (entry) =>
      entry.employee_id === employeeId &&
      entry.assignment_id !== excludeAssignmentId
  )

  if (hasShiftOverlap(shift, assignedShifts)) {
    throw new Error("That team member already has an overlapping shift.")
  }
}

function assertShiftBeforeCutoff(shift: PublishedShiftRow) {
  const cutoffAt = getShiftSwapCutoffAt(new Date(shift.starts_at))

  if (isPastShiftSwapCutoff(cutoffAt)) {
    throw new Error(
      "Shift swaps and covers must be handled at least 2 hours before the shift starts."
    )
  }
}

function assertRequestBeforeCutoff(request: { cutoff_at: string | Date }) {
  if (isPastShiftSwapCutoff(new Date(request.cutoff_at))) {
    throw new Error(
      "This request is inside the 2 hour cutoff and can no longer be changed."
    )
  }
}

async function getRequestForAction(requestId: string) {
  const result = await getDatabase().query<{
    accepted_response_id: string | null
    cutoff_at: string
    id: string
    requester_user_id: string
    request_type: "swap" | "cover"
    rota_id: string
    source_assignment_id: string
    status: string
    target_assignment_id: string | null
  }>(
    `select id,
            request_type,
            status,
            rota_id,
            source_assignment_id,
            target_assignment_id,
            requester_user_id,
            accepted_response_id,
            cutoff_at::text
     from public.shift_swap_requests
     where id = $1::uuid
     limit 1`,
    [requestId]
  )
  const request = result.rows[0]

  if (!request) {
    throw new Error("That shift swap request could not be found.")
  }

  return request
}

async function getPendingResponseForUser(requestId: string, userId: string) {
  const result = await getDatabase().query<{
    id: string
  }>(
    `select id
     from public.shift_swap_responses
     where request_id = $1::uuid
       and responder_user_id = $2
       and status = 'pending'
     limit 1`,
    [requestId, userId]
  )
  const response = result.rows[0]

  if (!response) {
    throw new Error("That swap request is not waiting for your response.")
  }

  return response
}

async function getAcceptedResponse(responseId: string) {
  const result = await getDatabase().query<{
    id: string
    responder_employee_id: string
  }>(
    `select id, responder_employee_id
     from public.shift_swap_responses
     where id = $1::uuid
       and status = 'accepted'
     limit 1`,
    [responseId]
  )
  const response = result.rows[0]

  if (!response) {
    throw new Error("That accepted response could not be found.")
  }

  return response
}

async function assertNoTimeEntriesForApproval(
  client: PoolClient | undefined,
  pairs: Array<[string, string]>
) {
  for (const [employeeId, publishedShiftId] of pairs) {
    if (
      await hasTimeEntryForShift({
        client,
        employeeId,
        publishedShiftId,
      })
    ) {
      throw new Error(
        "This request cannot be changed because a related shift already has a time entry."
      )
    }
  }
}

export {
  approveShiftSwapRequest,
  cancelShiftSwapRequest,
  createCoverRequest,
  createSwapRequest,
  denyShiftSwapRequest,
  offerCover,
  respondToSwapRequest,
}
