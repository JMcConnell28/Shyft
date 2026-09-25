import { createServerFn } from "@tanstack/react-start"
import { requireWorkspaceWriteAccess } from "@/features/billing/server/workspace-write-access"

import {
  getGeneralSettingsInputSchema,
  updateGeneralSettingsInputSchema,
} from "@/features/settings/schemas/general-settings-schemas"
import {
  createLocationInputSchema,
  getLocationSettingsInputSchema,
  updateLocationSettingsInputSchema,
} from "@/features/settings/schemas/location-settings-schemas"
import {
  createZoneInputSchema,
  deleteRotaTemplateInputSchema,
  deleteZoneInputSchema,
  getRotaSettingsInputSchema,
  renameRotaTemplateInputSchema,
  updateRotaSettingsInputSchema,
  updateZoneInputSchema,
} from "@/features/settings/schemas/rota-settings-schemas"

const getGeneralSettingsPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    getGeneralSettingsInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/queries")
    return module.getGeneralSettingsPageData(data)
  })

const updateGeneralSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    updateGeneralSettingsInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/actions")
    return module.updateGeneralSettings(data)
  })

const getLocationSettingsPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    getLocationSettingsInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/location-queries")
    return module.getLocationSettingsPageData(data)
  })

const createLocation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createLocationInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/location-actions")
    return module.createLocation(data)
  })

const updateLocationSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    updateLocationSettingsInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/location-actions")
    return module.updateLocationSettings(data)
  })

const getRotaSettingsPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => getRotaSettingsInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/rota-queries")
    return module.getRotaSettingsPageData(data)
  })

const updateRotaSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    updateRotaSettingsInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/rota-actions")
    return module.updateRotaSettings(data)
  })

const createZone = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createZoneInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/zone-actions")
    return module.createZone(data)
  })

const updateZone = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateZoneInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/zone-actions")
    return module.updateZone(data)
  })

const deleteZone = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deleteZoneInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/zone-actions")
    return module.deleteZone(data)
  })

const renameRotaTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    renameRotaTemplateInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/template-actions")
    return module.renameRotaTemplate(data)
  })

const deleteRotaTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    deleteRotaTemplateInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/template-actions")
    return module.deleteRotaTemplate(data)
  })

export {
  createLocation,
  createZone,
  deleteRotaTemplate,
  deleteZone,
  getGeneralSettingsPageData,
  getLocationSettingsPageData,
  getRotaSettingsPageData,
  renameRotaTemplate,
  updateGeneralSettings,
  updateLocationSettings,
  updateRotaSettings,
  updateZone,
}
