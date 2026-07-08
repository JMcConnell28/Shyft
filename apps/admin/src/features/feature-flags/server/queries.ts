import "@tanstack/react-start/server-only"

import { queryMany } from "@rocketrota/db"

import type {
  FeatureFlag,
  FeatureFlagValue,
  FeatureFlagTarget,
  FeatureFlagsPageData,
} from "@/features/feature-flags/types"

type FlagRow = {
  default_value: unknown
  description: string | null
  id: string
  is_enabled: boolean
  key: string
  name: string
  updated_at: Date | string
}

type TargetRow = {
  feature_flag_id: string
  id: string
  label: string
  target_id: string
  target_type: "organization" | "location"
  value: unknown
}

async function listFeatureFlags(): Promise<FeatureFlagsPageData> {
  const [flags, targets] = await Promise.all([
    queryMany<FlagRow>(
      `select id,
              key,
              name,
              description,
              is_enabled,
              default_value,
              updated_at
       from admin_private.feature_flags
       order by key`,
    ),
    queryMany<TargetRow>(
      `select target.id,
              target.feature_flag_id,
              target.target_type,
              coalesce(target.organization_id, target.location_id::text) as target_id,
              target.value,
              coalesce(organization_row.name, location.name) as label
       from admin_private.feature_flag_targets target
       left join public."organization" organization_row
         on organization_row.id = target.organization_id
       left join public.locations location
         on location.id = target.location_id
       order by label`,
    ),
  ])

  const targetsByFlagId = new Map<string, FeatureFlagTarget[]>()

  for (const target of targets) {
    const entries = targetsByFlagId.get(target.feature_flag_id) ?? []
    entries.push({
      id: target.id,
      label: target.label,
      targetId: target.target_id,
      targetType: target.target_type,
      value: toFeatureFlagValue(target.value),
    })
    targetsByFlagId.set(target.feature_flag_id, entries)
  }

  return {
    flags: flags.map((flag) => mapFlag(flag, targetsByFlagId.get(flag.id) ?? [])),
  }
}

function mapFlag(row: FlagRow, targets: FeatureFlagTarget[]): FeatureFlag {
  return {
    defaultValue: toFeatureFlagValue(row.default_value),
    description: row.description,
    id: row.id,
    isEnabled: row.is_enabled,
    key: row.key,
    name: row.name,
    targets,
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

function toFeatureFlagValue(value: unknown): FeatureFlagValue {
  if (
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return value
  }

  return false
}

export { listFeatureFlags }
