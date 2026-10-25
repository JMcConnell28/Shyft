import "@tanstack/react-start/server-only"

import { z } from "zod"
import { getDatabase } from "@/lib/db"

const locationSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  organizationId: z.string(),
})
type OrganizationLocationSummary = z.infer<typeof locationSummarySchema>

// Callers establish membership and the required manager capability first.
async function listOrganizationLocationSummaries(
  organizationId: string
): Promise<Array<OrganizationLocationSummary>> {
  const result = await getDatabase().query<OrganizationLocationSummary>(
    `select id, name, slug, organization_id as "organizationId"
     from public.locations
     where organization_id = $1
     order by created_at, name`,
    [organizationId]
  )
  return z.array(locationSummarySchema).parse(result.rows)
}

export { listOrganizationLocationSummaries }
