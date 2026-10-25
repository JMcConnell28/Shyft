import "@tanstack/react-start/server-only"
import { getDatabase } from "@rocketrota/db"
import { featureFlagDefinitions } from "@rocketrota/shared/feature-flags"
import type {
  UpdateFeatureFlagInput,
  UpdateLocationFlagInput,
} from "../schemas/feature-flag-schemas"
import { writeAdminAuditLog } from "@/features/audit/server/audit-log"

async function changeFeatureFlag(
  input: UpdateFeatureFlagInput | UpdateLocationFlagInput,
  adminUserId: string
): Promise<void> {
  const definition = featureFlagDefinitions.find(
    (flag) => flag.key === input.key
  )
  if (!definition) throw new Error("Choose an implemented feature flag.")
  const client = await getDatabase().connect()
  try {
    await client.query("begin")
    await client.query(
      `insert into admin_private.feature_flags(key,name,description,is_enabled,default_value)
      values($1,$2,$3,true,$4::jsonb) on conflict(key) do nothing`,
      [
        definition.key,
        definition.name,
        definition.description,
        JSON.stringify(definition.defaultEnabled),
      ]
    )
    const current = await client.query<{
      id: string
      revision: number
      is_enabled: boolean
      default_value: unknown
    }>(
      `select id,revision,is_enabled,default_value from admin_private.feature_flags where key=$1 for update`,
      [input.key]
    )
    const flag = current.rows.at(0)
    if (!flag) throw new Error("Feature flag not found.")
    if (flag.revision !== input.expectedRevision)
      throw new Error("Another admin changed this flag. Refresh before saving.")
    let before: unknown = {
      isEnabled: flag.is_enabled,
      defaultValue: flag.default_value,
    }
    if ("locationId" in input) {
      const location = await client.query(
        `select id from public.locations where id=$1`,
        [input.locationId]
      )
      if (!location.rows.length) throw new Error("Choose a valid location.")
      const previous = await client.query<{ value: unknown }>(
        `select value from admin_private.feature_flag_targets where feature_flag_id=$1 and location_id=$2 and target_type='location'`,
        [flag.id, input.locationId]
      )
      before = { override: previous.rows.at(0)?.value ?? null }
      if (input.override === "inherit") {
        await client.query(
          `delete from admin_private.feature_flag_targets where feature_flag_id=$1 and location_id=$2 and target_type='location'`,
          [flag.id, input.locationId]
        )
      } else {
        await client.query(
          `insert into admin_private.feature_flag_targets(feature_flag_id,target_type,location_id,value,created_by_admin_user_id)
          values($1,'location',$2,$3::jsonb,$4) on conflict(feature_flag_id,location_id) where location_id is not null
          do update set value=excluded.value,created_by_admin_user_id=excluded.created_by_admin_user_id`,
          [
            flag.id,
            input.locationId,
            JSON.stringify(input.override === "enabled"),
            adminUserId,
          ]
        )
      }
      await client.query(
        `update admin_private.feature_flags set revision=revision+1,updated_at=now(),updated_by_admin_user_id=$2 where id=$1`,
        [flag.id, adminUserId]
      )
    } else {
      await client.query(
        `update admin_private.feature_flags set is_enabled=$2,default_value=$3::jsonb,revision=revision+1,updated_at=now(),updated_by_admin_user_id=$4 where id=$1`,
        [
          flag.id,
          input.mode !== "off",
          JSON.stringify(input.mode === "all"),
          adminUserId,
        ]
      )
    }
    await writeAdminAuditLog(
      {
        action:
          "locationId" in input
            ? "feature_flag.location_updated"
            : "feature_flag.mode_updated",
        adminUserId,
        permission: "feature_flags.manage",
        targetType: "feature_flag",
        targetId: input.key,
        beforeState: before,
        afterState:
          "locationId" in input
            ? { override: input.override }
            : { mode: input.mode },
        metadata: {
          locationId: "locationId" in input ? input.locationId : null,
          reason: input.reason || null,
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
export { changeFeatureFlag }
