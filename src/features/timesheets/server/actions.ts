import type { PoolClient } from "pg"

import { resolveTimesheetAccess } from "@/features/timesheets/server/access"
import type { UpdateTimesheetEntryInput } from "@/features/timesheets/types"
import { getDatabase } from "@/lib/db"

type EditableEntryRow = {
  clocked_in_at: string
  clocked_out_at: string | null
  employee_id: string
  location_id: string
  notes: string | null
  organization_id: string | null
  payable_end_at: string | null
  payable_start_at: string | null
  status: "open" | "closed" | "requires_review"
}

async function updateTimesheetEntry(input: UpdateTimesheetEntryInput) {
  const scope = await resolveTimesheetAccess(input)

  if (!scope.canManage) {
    throw new Error("You do not have permission to edit timesheets.")
  }

  return withTimesheetTransaction((client) =>
    updateTimesheetEntryInTransaction(client, {
      ...input,
      scopedLocationIds: scope.locationIds,
      userId: scope.userId,
    }),
  )
}

async function withTimesheetTransaction<T>(
  run: (client: PoolClient) => Promise<T>,
) {
  const client = await getDatabase().connect()

  try {
    await client.query("BEGIN")
    const result = await run(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

async function updateTimesheetEntryInTransaction(
  client: PoolClient,
  input: UpdateTimesheetEntryInput & {
    scopedLocationIds: string[]
  },
) {
  const existing = await getEditableEntry(client, input.entryId)

  if (!input.scopedLocationIds.includes(existing.location_id)) {
    throw new Error("Choose a time entry you can manage.")
  }

  const updated = await updateEntry(client, {
    ...input,
    existing,
  })

  await insertAdjustmentEvent(client, {
    employeeId: existing.employee_id,
    entryId: input.entryId,
    existing,
    locationId: existing.location_id,
    organizationId: existing.organization_id,
    performedByUserId: input.userId,
    reason: input.reason,
    updated,
  })

  return { success: true as const }
}

async function getEditableEntry(client: PoolClient, entryId: string) {
  const result = await client.query<EditableEntryRow>(
    `select
       organization_id,
       location_id,
       employee_id,
       clocked_in_at::text,
       clocked_out_at::text,
       payable_start_at::text,
       payable_end_at::text,
       status,
       notes
     from public.time_entries
     where id = $1::uuid
     for update`,
    [entryId],
  )
  const entry = result.rows[0]

  if (!entry) {
    throw new Error("Choose a valid time entry.")
  }

  return entry
}

async function updateEntry(
  client: PoolClient,
  input: UpdateTimesheetEntryInput & {
    existing: EditableEntryRow
  },
) {
  const result = await client.query<EditableEntryRow>(
    `update public.time_entries
     set clocked_in_at = $2::timestamptz,
         clocked_out_at = $3::timestamptz,
         payable_start_at = $4::timestamptz,
         payable_end_at = $5::timestamptz,
         status = $6,
         source = 'adjustment',
         notes = case
           when notes is null or notes = '' then $7
           else notes || E'\n' || $7
         end,
         updated_by = $8,
         updated_at = timezone('utc', now())
     where id = $1::uuid
     returning
       organization_id,
       location_id,
       employee_id,
       clocked_in_at::text,
       clocked_out_at::text,
       payable_start_at::text,
       payable_end_at::text,
       status,
       notes`,
    [
      input.entryId,
      input.clockedInAt,
      input.clockedOutAt,
      input.payableStartAt,
      input.payableEndAt,
      input.status,
      `Manager edit: ${input.reason}`,
      input.userId,
    ],
  )
  const entry = result.rows[0]

  if (!entry) {
    throw new Error("We could not update that timesheet entry.")
  }

  return entry
}

async function insertAdjustmentEvent(
  client: PoolClient,
  input: {
    employeeId: string
    entryId: string
    existing: EditableEntryRow
    locationId: string
    organizationId: string | null
    performedByUserId: string
    reason: string
    updated: EditableEntryRow
  },
) {
  await client.query(
    `insert into public.clock_events (
       time_entry_id,
       organization_id,
       location_id,
       employee_id,
       performed_by_user_id,
       event_type,
       reason,
       metadata
     ) values ($1, $2, $3, $4, $5, 'manager_adjustment', $6, $7::jsonb)`,
    [
      input.entryId,
      input.organizationId,
      input.locationId,
      input.employeeId,
      input.performedByUserId,
      input.reason,
      JSON.stringify({
        before: getAuditSnapshot(input.existing),
        after: getAuditSnapshot(input.updated),
      }),
    ],
  )
}

function getAuditSnapshot(entry: EditableEntryRow) {
  return {
    clockedInAt: entry.clocked_in_at,
    clockedOutAt: entry.clocked_out_at,
    payableStartAt: entry.payable_start_at,
    payableEndAt: entry.payable_end_at,
    status: entry.status,
  }
}

export { updateTimesheetEntry }
