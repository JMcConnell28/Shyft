import type {
  FeatureFlagKey,
  FeatureFlagMode,
  FeatureFlagOverride,
  FeatureFlagResolution,
  LocationFeatureFlags,
} from "./types"

const featureFlagDefinitions = [
  {
    key: "company.sage_employee_import",
    name: "Sage employee imports",
    description:
      "Import Sage employee payroll references. Company-wide imports require access at every location. Existing references, manual edits and Sage timesheet exports remain available.",
    defaultEnabled: true,
  },
  {
    key: "rota.budget_manager",
    name: "Budget manager",
    description:
      "Set and edit weekly budgets, view budget suggestions and show budget warnings. Saved budgets are retained when disabled.",
    defaultEnabled: true,
  },
  {
    key: "rota.templates",
    name: "Rota templates",
    description: "Create, update and apply saved rota templates.",
    defaultEnabled: true,
  },
  {
    key: "rota.publishing",
    name: "Rota publishing",
    description:
      "Publish, republish and unpublish rotas. Existing published rotas remain readable.",
    defaultEnabled: true,
  },
  {
    key: "shift_swaps",
    name: "Shift swaps",
    description:
      "Access shift swap and cover requests at enabled locations. Workspace settings and permissions still apply.",
    defaultEnabled: true,
  },
  {
    key: "time_clock.clock_in",
    name: "New clock-ins",
    description:
      "Employee and manager clock-ins. Clock-out, attendance history and automatic clock-out remain available.",
    defaultEnabled: true,
  },
  {
    key: "station_purchases",
    name: "Extra station purchases",
    description:
      "Start checkout for additional physical stations. Existing orders, included stations and billing are unaffected.",
    defaultEnabled: true,
  },
] as const

function resolveFeatureFlag(
  defaultEnabled: boolean,
  configuration?: {
    isEnabled: boolean
    defaultValue: boolean
    locationValue?: boolean | null
  }
): FeatureFlagResolution {
  if (!configuration) return { enabled: defaultEnabled, source: "default" }
  if (!configuration.isEnabled) return { enabled: false, source: "global_off" }
  if (typeof configuration.locationValue === "boolean")
    return { enabled: configuration.locationValue, source: "location" }
  return { enabled: configuration.defaultValue, source: "global" }
}

function defaultFor(key: FeatureFlagKey): FeatureFlagResolution {
  return {
    enabled:
      featureFlagDefinitions.find((flag) => flag.key === key)?.defaultEnabled ??
      false,
    source: "default",
  }
}
function getDefaultFeatureFlags(): LocationFeatureFlags {
  return {
    "company.sage_employee_import": defaultFor("company.sage_employee_import"),
    "rota.budget_manager": defaultFor("rota.budget_manager"),
    "rota.templates": defaultFor("rota.templates"),
    "rota.publishing": defaultFor("rota.publishing"),
    shift_swaps: defaultFor("shift_swaps"),
    "time_clock.clock_in": defaultFor("time_clock.clock_in"),
    station_purchases: defaultFor("station_purchases"),
  }
}

const featureFlagModeLabels: Record<FeatureFlagMode, string> = {
  off: "Off everywhere",
  selected: "Selected locations",
  all: "All locations",
}
const featureFlagOverrideLabels: Record<FeatureFlagOverride, string> = {
  inherit: "Use global setting",
  enabled: "Enabled",
  disabled: "Disabled",
}
export {
  featureFlagDefinitions,
  featureFlagModeLabels,
  featureFlagOverrideLabels,
  getDefaultFeatureFlags,
  resolveFeatureFlag,
}
export type {
  FeatureFlagKey,
  FeatureFlagMode,
  FeatureFlagOverride,
  FeatureFlagResolution,
  LocationFeatureFlags,
} from "./types"
