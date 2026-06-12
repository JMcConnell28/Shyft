import { createServerFn } from "@tanstack/react-start"

import {
  timesheetScopeSchema,
  updateTimesheetEntryInputSchema,
} from "@/features/timesheets/schemas/timesheet-schemas"

const getTimesheetPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => timesheetScopeSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/timesheets/server/queries")
    return module.getTimesheetPageData(data)
  })

const updateTimesheetEntry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    updateTimesheetEntryInputSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/timesheets/server/actions")
    return module.updateTimesheetEntry(data)
  })

export { getTimesheetPageData, updateTimesheetEntry }
