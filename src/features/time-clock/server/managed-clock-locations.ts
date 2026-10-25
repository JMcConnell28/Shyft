import "@tanstack/react-start/server-only"

import { z } from "zod"
import { getDatabase } from "@/lib/db"
import { listOrganizationLocationSummaries } from "@/features/locations/server/location-summaries"

const managedLocationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  organizationId: z.string().nullable(),
})
type ManagedLocation = z.infer<typeof managedLocationSchema>

// Scope is established by the clock permission helpers before this read.
async function listManagedClockLocations(scope: {
  organizationId: string | null
  locationId: string | null
}): Promise<Array<ManagedLocation>> {
  if (scope.organizationId) {
    const locations = await listOrganizationLocationSummaries(
      scope.organizationId
    )
    return locations.map(({ id, name, organizationId }) => ({
      id,
      name,
      organizationId,
    }))
  }
  if (!scope.locationId) return []
  const result = await getDatabase().query<ManagedLocation>(
    `select id, name, organization_id as "organizationId"
     from public.locations where id = $1::uuid
     order by created_at, name`,
    [scope.locationId]
  )
  return z.array(managedLocationSchema).parse(result.rows)
}

export { listManagedClockLocations }
export type { ManagedLocation }
