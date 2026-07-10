import { z } from "zod"

const updateSupportThreadStatusSchema = z.object({
  id: z.uuid(),
  status: z.enum(["open", "waiting", "resolved", "closed"]),
})

export { updateSupportThreadStatusSchema }
