import { z } from "zod"

const dashboardWelcomeWorkspaceSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().trim().min(1),
    type: z.literal("organization"),
  }),
  z.object({
    id: z.uuid(),
    type: z.literal("location"),
  }),
])

export { dashboardWelcomeWorkspaceSchema }
