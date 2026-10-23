import "@tanstack/react-start/server-only"
import { getDatabase } from "@rocketrota/db"
import { getRequestStorage } from "./request-storage"
import { generateClockStationTag } from "@/features/clock-stations/server/actions"
import { writeAdminAuditLog } from "@/features/audit/server/audit-log"

async function setupRequestTag(
  input: { requestId: string; tagId?: string },
  adminUserId: string
): Promise<void> {
  const storage = getRequestStorage(input.requestId)
  const client = await getDatabase().connect()
  try {
    await client.query("begin")
    await client.query(
      `select ${storage.key} from ${storage.table} where ${storage.key} = $1 for update`,
      [storage.id]
    )
    const result = await client.query<{
      location_id: string
      clock_tag_id: string | null
      fulfillment_status: string
    }>(
      `select location_id, clock_tag_id, fulfillment_status from billing_private.station_fulfillment_requests where request_id = $1`,
      [input.requestId]
    )
    const request = result.rows.at(0)
    if (!request) throw new Error("Station request not found.")
    if (request.clock_tag_id)
      throw new Error("This station already has an NFC tag assigned.")
    if (["shipped", "delivered"].includes(request.fulfillment_status))
      throw new Error("A dispatched station cannot be reassigned.")
    const tagId =
      input.tagId ??
      (
        await generateClockStationTag(
          { locationId: request.location_id, adminUserId },
          client
        )
      ).id
    // Lock the tag, then check both sources so one physical tag cannot fulfil two stations.
    const tag = await client.query<{ id: string }>(
      `select id from public.clock_tags where id = $1 and location_id = $2 and is_active and ntag_public_id is not null and ntag_aes_key_hex is not null for update`,
      [tagId, request.location_id]
    )
    if (!tag.rows.length)
      throw new Error("Choose an active NFC tag for this location.")
    const assigned = await client.query(
      `select location_id::text as id from billing_private.location_hardware_entitlements where clock_tag_id = $1
       union all select id::text from billing_private.clock_station_purchases where clock_tag_id = $1`,
      [tagId]
    )
    if (assigned.rows.length)
      throw new Error("This NFC tag is already assigned to another station.")
    await client.query(
      `update ${storage.table} set clock_tag_id = $2, updated_at = now() where ${storage.key} = $1`,
      [storage.id, tagId]
    )
    await writeAdminAuditLog(
      {
        action: "clock_station.tag_assigned",
        adminUserId,
        permission: "clock_stations.manage",
        targetType: "station_request",
        targetId: input.requestId,
        afterState: { tagId },
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
export { setupRequestTag }
