import "@tanstack/react-start/server-only"

import { z } from "zod"
import { getDatabase } from "@/lib/db"

const locationExistsSchema = z.object({ has_location: z.boolean() })

async function organizationHasLocation(
  organizationId: string
): Promise<boolean> {
  const result = await getDatabase().query<{ has_location: boolean }>(
    `select exists (
       select 1 from public.locations where organization_id = $1
     ) as has_location`,
    [organizationId]
  )
  return locationExistsSchema.parse(result.rows.at(0)).has_location
}

export { organizationHasLocation }
