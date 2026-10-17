import { z } from "zod"

const timesheetSearchSchema = z.object({
  weekStart: z.iso.date().optional().catch(undefined),
  entryId: z.uuid().optional().catch(undefined),
})
export { timesheetSearchSchema }
