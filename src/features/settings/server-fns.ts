import { createServerFn } from "@tanstack/react-start"

import {
  getGeneralSettingsInputSchema,
  updateGeneralSettingsInputSchema,
} from "@/features/settings/schemas/general-settings-schemas"
import {
  getLocationSettingsInputSchema,
  updateLocationSettingsInputSchema,
} from "@/features/settings/schemas/location-settings-schemas"
import {
  createOrganizationFromLocationInputSchema,
  moveLocationToOrganizationBillingInputSchema,
  moveLocationToOrganizationInputSchema,
  workspaceConnectionsInputSchema,
} from "@/features/settings/schemas/connection-settings-schemas"
import {
  createZoneInputSchema,
  deleteZoneInputSchema,
  deleteRotaTemplateInputSchema,
  getRotaSettingsInputSchema,
  renameRotaTemplateInputSchema,
  updateZoneInputSchema,
} from "@/features/settings/schemas/rota-settings-schemas"

const getGeneralSettingsPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => getGeneralSettingsInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/queries")
    return module.getGeneralSettingsPageData(data)
  })

const updateGeneralSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateGeneralSettingsInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/actions")
    return module.updateGeneralSettings(data)
  })

const getLocationSettingsPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => getLocationSettingsInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/location-queries")
    return module.getLocationSettingsPageData(data)
  })

const updateLocationSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    updateLocationSettingsInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/location-actions")
    return module.updateLocationSettings(data)
  })

const getWorkspaceConnectionsPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    workspaceConnectionsInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import(
      "@/features/settings/server/connection-queries"
    )
    return module.getWorkspaceConnectionsPageData(data)
  })

const moveLocationToOrganization = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    moveLocationToOrganizationInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import(
      "@/features/settings/server/connection-actions"
    )
    return module.moveLocationToOrganization(data)
  })

const createOrganizationFromLocation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    createOrganizationFromLocationInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import(
      "@/features/settings/server/connection-actions"
    )
    return module.createOrganizationFromLocation(data)
  })

const moveLocationToOrganizationBilling = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    moveLocationToOrganizationBillingInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import(
      "@/features/settings/server/connection-actions"
    )
    return module.moveLocationToOrganizationBilling(data)
  })

const getRotaSettingsPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => getRotaSettingsInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/rota-queries")
    return module.getRotaSettingsPageData(data)
  })

const createZone = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createZoneInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/zone-actions")
    return module.createZone(data)
  })

const updateZone = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateZoneInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/zone-actions")
    return module.updateZone(data)
  })

const deleteZone = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deleteZoneInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/zone-actions")
    return module.deleteZone(data)
  })

const renameRotaTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    renameRotaTemplateInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/template-actions")
    return module.renameRotaTemplate(data)
  })

const deleteRotaTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    deleteRotaTemplateInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/template-actions")
    return module.deleteRotaTemplate(data)
  })

export {
  createOrganizationFromLocation,
  createZone,
  deleteRotaTemplate,
  deleteZone,
  getGeneralSettingsPageData,
  getLocationSettingsPageData,
  getWorkspaceConnectionsPageData,
  getRotaSettingsPageData,
  moveLocationToOrganization,
  moveLocationToOrganizationBilling,
  renameRotaTemplate,
  updateGeneralSettings,
  updateLocationSettings,
  updateZone,
}
