import { createServerFn } from "@tanstack/react-start"

import {
  sageTimesheetExportInputSchema,
  timesheetScopeSchema,
  updateTimesheetEntryInputSchema,
} from "@/features/timesheets/schemas/timesheet-schemas"

const getSageTimesheetExportData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    sageTimesheetExportInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/timesheets/server/sage-export")
    return module.getSageTimesheetExportData(data)
  })

const getTimesheetPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => timesheetScopeSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/timesheets/server/queries")
    return module.getTimesheetPageData(data)
  })

const updateTimesheetEntry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    updateTimesheetEntryInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/timesheets/server/actions")
    return module.updateTimesheetEntry(data)
  })

export {
  getSageTimesheetExportData,
  getTimesheetPageData,
  updateTimesheetEntry,
}
