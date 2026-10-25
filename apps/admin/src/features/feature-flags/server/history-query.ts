import "@tanstack/react-start/server-only"
import { queryMany } from "@rocketrota/db"
import { describeFlagState } from "./history-label"
import type { FeatureFlagKey } from "@rocketrota/shared/feature-flags/types"
import type { FlagHistoryEntry } from "../types"

async function getFlagHistory(
  key: FeatureFlagKey
): Promise<Array<FlagHistoryEntry>> {
  const rows = await queryMany<{
    id: string
    actor: string
    created_at: Date
    before_state: unknown
    after_state: unknown
    location_id: string | null
    location_name: string | null
    reason: string | null
  }>(
    `select log.id,coalesce(u.name,log.admin_user_id,'Deleted admin') as actor,log.created_at,log.before_state,log.after_state,
      log.metadata->>'locationId' as location_id,l.name as location_name,log.metadata->>'reason' as reason
      from admin_private.admin_audit_logs log left join admin_private.admin_user u on u.id=log.admin_user_id
      left join public.locations l on l.id::text=log.metadata->>'locationId'
      where log.target_type='feature_flag' and log.target_id=$1 order by log.created_at desc,log.id desc limit 50`,
    [key]
  )
  return rows.map((row) => ({
    id: row.id,
    actor: row.actor,
    createdAt: row.created_at.toISOString(),
    before: describeFlagState(row.before_state),
    after: describeFlagState(row.after_state),
    locationName: row.location_name,
    locationId: row.location_id,
    reason: row.reason,
  }))
}
export { getFlagHistory }
