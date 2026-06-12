import { BriefcaseBusinessIcon, MapPinnedIcon } from "lucide-react"

import type {
  OnboardingBusinessType,
  OnboardingPlanningMode,
} from "@/features/onboarding/schemas/onboarding-schemas"

type BusinessTypeOption = {
  value: OnboardingBusinessType
  label: string
  description: string
  planningMode: OnboardingPlanningMode
  icon: typeof MapPinnedIcon
}

const businessTypeOptions = [
  {
    value: "hospitality",
    label: "Regular workplace",
    description:
      "Your team usually works from the same place. Examples: pub, shop, salon, clinic or venue.",
    planningMode: "fixed_location",
    icon: MapPinnedIcon,
  },
  {
    value: "mobile_events_contracts",
    label: "Changing worksites",
    description:
      "Your team moves between clients, jobs or sites. Examples: cleaning, security, events or contracts.",
    planningMode: "variable_location",
    icon: BriefcaseBusinessIcon,
  },
] as const satisfies readonly BusinessTypeOption[]

const areaPresets: Partial<Record<OnboardingBusinessType, readonly string[]>> =
  {
    hospitality: ["Main area", "Front", "Back", "Admin"],
    retail: ["Shop floor", "Stockroom", "Till"],
    salon_clinic_venue: ["Reception", "Treatment room", "Main floor"],
  }

const fixedProgress = [20, 40, 65, 85, 100] as const
const variableProgress = [20, 45, 70, 90, 100] as const

function getBusinessTypeOption(value: OnboardingBusinessType) {
  return businessTypeOptions.find((option) => option.value === value)
}

function getPlanningModeForBusinessType(value: OnboardingBusinessType) {
  return getBusinessTypeOption(value)?.planningMode ?? "fixed_location"
}

function getDefaultZoneNames(value: OnboardingBusinessType) {
  return [...(areaPresets[value] ?? ["Main area"])]
}

export {
  areaPresets,
  businessTypeOptions,
  fixedProgress,
  getBusinessTypeOption,
  getDefaultZoneNames,
  getPlanningModeForBusinessType,
  variableProgress,
}
