import { z } from "zod"

const clockReminderSchema = z.object({
  id: z.uuid(),
  userId: z.string().nullable(),
  workspaceSlug: z.string(),
  scheduled: z.boolean(),
  limitMinutes: z.number().int().positive(),
})
const clockClosureCountSchema = z.object({ closed: z.number().int() })
const clockReminderOpenSchema = z.object({ open: z.boolean() })

export { clockReminderSchema, clockClosureCountSchema, clockReminderOpenSchema }
