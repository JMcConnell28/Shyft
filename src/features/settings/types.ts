import type { RotaSettingsValues } from "@/features/rota/types/settings"
import type { LocationAddress } from "@/features/locations/schemas/location-address-schema"

type GeneralSettingsPageData = {
  contactEmail: string
  contactPhone: string
  locations: Array<GeneralSettingsLocation>
  organization: {
    name: string
    slug: string
  }
}

type GeneralSettingsLocation = {
  id: string
  name: string
  slug: string
}

type LocationSettingsItem = {
  address: LocationAddress | null
  daySettings: Array<{
    closeTime: string
    closeTimeNextDay: boolean
    weekday: number
  }>
  id: string
  name: string
  slug: string
  employeeCount: number
  zoneCount: number
  estimatedClosingTime: string
  estimatedClosingTimeNextDay: boolean
}

type LocationSettingsPageData = {
  locations: Array<LocationSettingsItem>
  totalEmployeeCount: number
}

type RotaSettingsZone = {
  id: string
  name: string
  sortOrder: number
}

type RotaSettingsLocation = {
  id: string
  name: string
  slug: string
  settings: RotaSettingsValues
  zones: Array<RotaSettingsZone>
}

type RotaSettingsTemplate = {
  id: string
  locationId: string
  locationName: string
  name: string
  shiftCount: number
}

type RotaSettingsPageData = {
  locations: Array<RotaSettingsLocation>
  templates: Array<RotaSettingsTemplate>
}

type WorkspaceConnectionOrganization = {
  id: string
  name: string
  slug: string
  billingAccountId: string | null
  billingStatus: string | null
}

type WorkspaceConnectionLocation = {
  id: string
  name: string
  slug: string
  organizationId: string | null
  organizationName: string | null
  billingAccountId: string | null
  billingScope: "location" | "organization" | null
  billingOrganizationId: string | null
  billingStatus: string | null
  canKeepBillingWhenMoved: boolean
}

type WorkspaceConnectionsPageData = {
  currentOrganization: WorkspaceConnectionOrganization | null
  currentLocation: WorkspaceConnectionLocation | null
  manageableOrganizations: Array<WorkspaceConnectionOrganization>
  manageableLocations: Array<WorkspaceConnectionLocation>
  organizationLocations: Array<WorkspaceConnectionLocation>
}

type CreateOrganizationFromLocationResult = {
  success: true
  organizationId: string
  organizationSlug: string
  stripeSyncWarning: string | null
}

export type {
  CreateOrganizationFromLocationResult,
  GeneralSettingsLocation,
  GeneralSettingsPageData,
  LocationSettingsItem,
  LocationSettingsPageData,
  RotaSettingsLocation,
  RotaSettingsPageData,
  RotaSettingsTemplate,
  RotaSettingsValues,
  RotaSettingsZone,
  WorkspaceConnectionLocation,
  WorkspaceConnectionOrganization,
  WorkspaceConnectionsPageData,
}
