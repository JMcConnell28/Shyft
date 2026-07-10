import { createServerFn } from "@tanstack/react-start"

import { clockScanSearchSchema } from "@/features/time-clock/schemas/clock-scan-schemas"
import {
  adminUserInputSchema,
  approveTimeEntryAsRecordedInputSchema,
  generateAdminClockTagSetupInputSchema,
  getClockSettingsPageInputSchema,
  getEmployeeClockPageInputSchema,
  getManagerClockPageInputSchema,
  managerClockOverrideInputSchema,
  submitEmployeeClockInputSchema,
  updateClockSettingsInputSchema,
} from "@/features/time-clock/schemas/time-clock-schemas"

const getEmployeeClockPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    getEmployeeClockPageInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/time-clock/server/queries")
    return module.getEmployeeClockPageData(data)
  })

const getClockScanPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => clockScanSearchSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/time-clock/server/ntag-clock-test")
    return module.getClockScanPageData(data)
  })

const getAdminClockTagsPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => adminUserInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/time-clock/server/admin-tags")
    return module.getAdminClockTagsPageData(data)
  })

const generateAdminClockTagSetup = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    generateAdminClockTagSetupInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/time-clock/server/admin-tags")
    return module.generateAdminClockTagSetup(data)
  })

const submitEmployeeClock = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    submitEmployeeClockInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/time-clock/server/actions")
    return module.submitEmployeeClock(data)
  })

const getManagerClockPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    getManagerClockPageInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/time-clock/server/queries")
    return module.getManagerClockPageData(data)
  })

const managerClockOverride = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    managerClockOverrideInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/time-clock/server/actions")
    return module.managerClockOverride(data)
  })

const approveTimeEntryAsRecorded = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    approveTimeEntryAsRecordedInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/time-clock/server/actions")
    return module.approveTimeEntryAsRecorded(data)
  })

const getClockSettingsPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    getClockSettingsPageInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/time-clock/server/queries")
    return module.getClockSettingsPageData(data)
  })

const updateClockSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    updateClockSettingsInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/time-clock/server/actions")
    return module.updateClockSettings(data)
  })

export {
  approveTimeEntryAsRecorded,
  generateAdminClockTagSetup,
  getAdminClockTagsPageData,
  getClockScanPageData,
  getClockSettingsPageData,
  getEmployeeClockPageData,
  getManagerClockPageData,
  managerClockOverride,
  submitEmployeeClock,
  updateClockSettings,
}
