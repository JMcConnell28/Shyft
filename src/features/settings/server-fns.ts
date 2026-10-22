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
  updateShiftSwapSettingInputSchema,
  updateZoneInputSchema,
} from "@/features/settings/schemas/rota-settings-schemas"

const getGeneralSettingsPageData = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    getGeneralSettingsInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/queries")
    return module.getGeneralSettingsPageData(data)
  })

const updateGeneralSettings = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    updateGeneralSettingsInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/actions")
    return module.updateGeneralSettings(data)
  })

const getLocationSettingsPageData = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    getLocationSettingsInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/location-queries")
    return module.getLocationSettingsPageData(data)
  })

const createLocation = createServerFn({ method: "POST" })
  .validator((input: unknown) => createLocationInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/location-actions")
    return module.createLocation(data)
  })

const updateLocationSettings = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    updateLocationSettingsInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/location-actions")
    return module.updateLocationSettings(data)
  })

const getRotaSettingsPageData = createServerFn({ method: "POST" })
  .validator((input: unknown) => getRotaSettingsInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/settings/server/rota-queries")
    return module.getRotaSettingsPageData(data)
  })

const updateRotaSettings = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    updateRotaSettingsInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/rota-actions")
    return module.updateRotaSettings(data)
  })

const updateShiftSwapSetting = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    updateShiftSwapSettingInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/shift-swap-setting")
    return module.updateShiftSwapSetting(data)
  })

const createZone = createServerFn({ method: "POST" })
  .validator((input: unknown) => createZoneInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/zone-actions")
    return module.createZone(data)
  })

const updateZone = createServerFn({ method: "POST" })
  .validator((input: unknown) => updateZoneInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/zone-actions")
    return module.updateZone(data)
  })

const deleteZone = createServerFn({ method: "POST" })
  .validator((input: unknown) => deleteZoneInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/zone-actions")
    return module.deleteZone(data)
  })

const renameRotaTemplate = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    renameRotaTemplateInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/settings/server/template-actions")
    return module.renameRotaTemplate(data)
  })

const deleteRotaTemplate = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
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
  updateShiftSwapSetting,
  updateZone,
}
