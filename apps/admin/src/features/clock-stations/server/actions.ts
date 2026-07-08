import "@tanstack/react-start/server-only"

import { createHash, randomBytes } from "node:crypto"

import { getDatabase, queryOne } from "@rocketrota/db"

import { writeAdminAuditLog } from "@/features/audit/server/audit-log"

type LocationRow = {
  id: string
  organization_id: string | null
}

type ClockTagRow = {
  id: string
  location_id: string
  ntag_aes_key_hex: string | null
  ntag_last_seen_counter: number
  ntag_public_id: string | null
}

async function generateClockStationTag(input: {
  adminUserId: string
  locationId: string
}) {
  const location = await queryOne<LocationRow>(
    `select id, organization_id
     from public.locations
     where id = $1
     limit 1`,
    [input.locationId],
  )

  if (!location) {
    throw new Error("Choose a valid location.")
  }

  const publicId = `clk_${randomBytes(16).toString("hex").toUpperCase()}`
  const aesKeyHex = randomBytes(16).toString("hex").toUpperCase()
  const legacyToken = randomBytes(24).toString("base64url")

  const result = await getDatabase().query<ClockTagRow>(
    `insert into public.clock_tags (
       created_by,
       is_active,
       label,
       location_id,
       ntag_aes_key_hex,
       ntag_last_seen_counter,
       ntag_public_id,
       organization_id,
       token_hash
     ) values ($1, true, 'NTAG 424 clock tag', $2, $3, 0, $4, $5, $6)
     returning id,
               location_id,
               ntag_aes_key_hex,
               ntag_last_seen_counter,
               ntag_public_id`,
    [
      input.adminUserId,
      location.id,
      aesKeyHex,
      publicId,
      location.organization_id,
      createHash("sha256").update(legacyToken).digest("hex"),
    ],
  )
  const tag = result.rows.at(0)

  if (!tag) {
    throw new Error("We could not generate tag setup data.")
  }

  await writeAdminAuditLog({
    action: "clock_station.tag_generated",
    adminUserId: input.adminUserId,
    afterState: tag,
    permission: "clock_stations.manage",
    targetId: tag.id,
    targetType: "clock_tag",
  })

  return tag
}

export { generateClockStationTag }
