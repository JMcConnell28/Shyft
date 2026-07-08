type FeatureFlagValue = boolean | number | string

type FeatureFlagTarget = {
  id: string
  label: string
  targetId: string
  targetType: "organization" | "location"
  value: FeatureFlagValue
}

type FeatureFlag = {
  defaultValue: FeatureFlagValue
  description: string | null
  id: string
  isEnabled: boolean
  key: string
  name: string
  targets: FeatureFlagTarget[]
  updatedAt: string
}

type FeatureFlagsPageData = {
  flags: FeatureFlag[]
}

export type {
  FeatureFlag,
  FeatureFlagTarget,
  FeatureFlagValue,
  FeatureFlagsPageData,
}
