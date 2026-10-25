import type {
  FeatureFlagKey,
  FeatureFlagMode,
  FeatureFlagOverride,
  FeatureFlagResolution,
} from "@rocketrota/shared/feature-flags/types"

type FeatureFlag = {
  key: FeatureFlagKey
  name: string
  description: string
  mode: FeatureFlagMode
  revision: number
  overrideCount: number
  updatedAt: string | null
}
type LocationFlagSetting = {
  flag: FeatureFlag
  override: FeatureFlagOverride
  effective: FeatureFlagResolution
}
type FlagLocation = {
  id: string
  name: string
  organizationName: string | null
  override: FeatureFlagOverride
  effective: FeatureFlagResolution
}
type FlagHistoryEntry = {
  id: string
  actor: string
  createdAt: string
  before: string
  after: string
  locationName: string | null
  locationId: string | null
  reason: string | null
}
type FeatureFlagsPageData = { flags: Array<FeatureFlag> }
export type {
  FeatureFlag,
  LocationFlagSetting,
  FlagLocation,
  FlagHistoryEntry,
  FeatureFlagsPageData,
}
