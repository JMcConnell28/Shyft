import "@tanstack/react-start/server-only"
import { getDatabase } from "@rocketrota/db"

import { validateFulfillmentTransition } from "../utils/fulfillment"
import { getRequestStorage } from "./request-storage"
import type { UpdateFulfillmentInput } from "../schemas"
import { writeAdminAuditLog } from "@/features/audit/server/audit-log"

async function updateFulfillment(
  input: UpdateFulfillmentInput,
  adminUserId: string
): Promise<void> {
  const storage = getRequestStorage(input.requestId)
  const client = await getDatabase().connect()
  try {
    await client.query("begin")
    // Serialize staff updates; billing state is checked again at the mutation.
    await client.query(
      `select ${storage.key} from ${storage.table} where ${storage.key} = $1 for update`,
      [storage.id]
    )
    const { rows } = await client.query<{
      fulfillment_status: string
      needs_station: boolean
      has_delivery_address: boolean
      has_tag: boolean
    }>(
      `select s.fulfillment_status, s.needs_station, s.has_delivery_address,
         exists(select 1 from public.clock_tags t where t.id = s.clock_tag_id and t.location_id = s.location_id and t.is_active and t.ntag_public_id is not null and t.ntag_aes_key_hex is not null) as has_tag
       from billing_private.station_fulfillment_requests s where request_id = $1`,
      [input.requestId]
    )
    const row = rows.at(0)
    if (!row?.fulfillment_status)
      throw new Error(
        "No clock-in station has been requested for this location."
      )
    if (row.fulfillment_status !== input.expectedStatus) {
      throw new Error(
        "Another admin updated this station. Refresh the customer page before saving."
      )
    }
    validateFulfillmentTransition(
      {
        currentStatus: row.fulfillment_status,
        needsStation: row.needs_station,
        hasTag: row.has_tag,
        hasAddress: row.has_delivery_address,
      },
      input.status
    )
    await client.query(
      `update ${storage.table}
       set fulfillment_status = $2, fulfillment_reference = nullif($3, ''), fulfillment_notes = nullif($4, ''),
           shipped_at = case when $2 = 'shipped' then coalesce(shipped_at, now()) else shipped_at end,
           delivered_at = case when $2 = 'delivered' then coalesce(delivered_at, now()) else delivered_at end,
           updated_at = now() where ${storage.key} = $1`,
      [storage.id, input.status, input.reference, input.notes]
    )
    await writeAdminAuditLog(
      {
        action: "clock_station.fulfillment_updated",
        adminUserId,
        permission: "clock_stations.manage",
        targetType: "station_request",
        targetId: input.requestId,
        beforeState: { status: row.fulfillment_status },
        afterState: {
          status: input.status,
          reference: input.reference,
          notes: input.notes,
        },
      },
      client
    )
    await client.query("commit")
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}
export { updateFulfillment }
