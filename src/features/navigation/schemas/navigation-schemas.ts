import { z } from "zod"

import { organizationSlugSchema } from "@/features/onboarding/schemas/onboarding-schemas"

const workspaceViewerInputSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
  workspaceSlug: organizationSlugSchema,
})

type WorkspaceViewerInput = z.infer<typeof workspaceViewerInputSchema>

export { workspaceViewerInputSchema }
export type { WorkspaceViewerInput }
