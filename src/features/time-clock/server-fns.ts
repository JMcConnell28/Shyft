import { createServerFn } from "@tanstack/react-start"

import {
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
  getClockSettingsPageData,
  getEmployeeClockPageData,
  getManagerClockPageData,
  managerClockOverride,
  submitEmployeeClock,
  updateClockSettings,
}
