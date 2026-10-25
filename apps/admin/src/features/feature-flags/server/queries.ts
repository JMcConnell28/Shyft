import "@tanstack/react-start/server-only"
import { queryMany, queryOne } from "@rocketrota/db"
import {
  featureFlagDefinitions,
  resolveFeatureFlag,
} from "@rocketrota/shared/feature-flags"
import { flagRowSchema, locationFlagValueSchema } from "./row-schemas"
import type {
  FeatureFlagKey,
  FeatureFlagMode,
  FeatureFlagOverride,
} from "@rocketrota/shared/feature-flags/types"
import type { FeatureFlag, FlagLocation, LocationFlagSetting } from "../types"
import type { FlagDetailsInput } from "../schemas/feature-flag-schemas"

type FlagRow = {
  key: FeatureFlagKey
  is_enabled: boolean
  default_value: unknown
  revision: number
  updated_at: Date
  override_count: string
}
function resolve(flag: FeatureFlag, value: unknown) {
  return resolveFeatureFlag(true, {
    isEnabled: flag.mode !== "off",
    defaultValue: flag.mode === "all",
    locationValue: locationFlagValueSchema.parse(value),
  })
}
function override(value: unknown): FeatureFlagOverride {
  const parsed = locationFlagValueSchema.parse(value)
  return parsed == null ? "inherit" : parsed ? "enabled" : "disabled"
}
function mode(isEnabled: boolean, defaultValue: boolean): FeatureFlagMode {
  return !isEnabled ? "off" : defaultValue ? "all" : "selected"
}
async function listFeatureFlags(): Promise<{ flags: Array<FeatureFlag> }> {
  const rawRows = await queryMany<FlagRow>(
    `select f.key,f.is_enabled,f.default_value,f.revision,f.updated_at,
    (select count(*) from admin_private.feature_flag_targets t where t.feature_flag_id=f.id and t.target_type='location') as override_count
    from admin_private.feature_flags f where f.key=any($1::text[])`,
    [featureFlagDefinitions.map((flag) => flag.key)]
  )
  const rows = flagRowSchema.array().parse(rawRows)
  return {
    flags: featureFlagDefinitions.map((definition) => {
      const row = rows.find((entry) => entry.key === definition.key)
      return {
        key: definition.key,
        name: definition.name,
        description: definition.description,
        mode: mode(
          row?.is_enabled ?? true,
          row?.default_value ?? definition.defaultEnabled
        ),
        revision: row?.revision ?? 0,
        overrideCount: Number(row?.override_count ?? 0),
        updatedAt: row?.updated_at.toISOString() ?? null,
      }
    }),
  }
}
async function getLocationFlagSettings(
  locationId: string
): Promise<{ locationName: string; flags: Array<LocationFlagSetting> }> {
  const location = await queryOne<{ name: string }>(
    `select name from public.locations where id=$1`,
    [locationId]
  )
  if (!location) throw new Error("Location not found.")
  const [{ flags }, targets] = await Promise.all([
    listFeatureFlags(),
    queryMany<{ key: FeatureFlagKey; value: unknown }>(
      `select f.key,t.value from admin_private.feature_flag_targets t join admin_private.feature_flags f on f.id=t.feature_flag_id where t.location_id=$1 and t.target_type='location'`,
      [locationId]
    ),
  ])
  return {
    locationName: location.name,
    flags: flags.map((flag) => {
      const value = targets.find((target) => target.key === flag.key)?.value
      return {
        flag,
        override: override(value),
        effective: resolve(flag, value),
      }
    }),
  }
}
async function getFlagLocations(input: FlagDetailsInput): Promise<{
  locations: Array<FlagLocation>
  total: number
  flag: FeatureFlag
}> {
  const { flags } = await listFeatureFlags()
  const flag = flags.find((entry) => entry.key === input.key)
  if (!flag) throw new Error("Feature flag not found.")
  const filter = `from public.locations l left join public.organization o on o.id=l.organization_id
    left join admin_private.feature_flags f on f.key=$1
    left join admin_private.feature_flag_targets t on t.feature_flag_id=f.id and t.location_id=l.id and t.target_type='location'
    where ($2='' or l.name ilike '%'||$2||'%' or o.name ilike '%'||$2||'%')`
  const [rows, count] = await Promise.all([
    queryMany<{
      id: string
      name: string
      organization_name: string | null
      value: unknown
    }>(
      `select l.id,l.name,o.name as organization_name,t.value ${filter} order by l.name,l.id limit 50 offset $3`,
      [input.key, input.search, (input.page - 1) * 50]
    ),
    queryOne<{ total: string }>(`select count(*) as total ${filter}`, [
      input.key,
      input.search,
    ]),
  ])
  return {
    flag,
    total: Number(count?.total ?? 0),
    locations: rows.map((row) => ({
      id: row.id,
      name: row.name,
      organizationName: row.organization_name,
      override: override(row.value),
      effective: resolve(flag, row.value),
    })),
  }
}
export { listFeatureFlags, getLocationFlagSettings, getFlagLocations }
