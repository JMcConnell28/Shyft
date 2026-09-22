import type { z } from "zod"
import type { WorkspaceSummary } from "@/features/onboarding/types"
import type { getRotaWorkspaceDataInputSchema } from "@/features/rota/schemas/rota-server-schemas"

type RotaWorkspaceQueryInput = z.infer<typeof getRotaWorkspaceDataInputSchema>

type RotaWorkspaceRouteInput = {
  workspace: WorkspaceSummary
  userId: string
  rotaId: string
  locationSlug?: string
  publishedOnly: boolean
}

export type { RotaWorkspaceQueryInput, RotaWorkspaceRouteInput }
