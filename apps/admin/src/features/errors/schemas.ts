import { z } from "zod"

const updateErrorStatusSchema = z.object({
  id: z.uuid(),
  status: z.enum(["open", "reviewing", "resolved", "ignored"]),
})

export { updateErrorStatusSchema }
