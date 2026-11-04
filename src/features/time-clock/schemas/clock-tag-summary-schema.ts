import { z } from "zod"

const clockTagSummaryRowsSchema = z.array(
  z.object({
    id: z.uuid(),
    location_id: z.uuid(),
    label: z.string(),
    ntag_last_seen_counter: z.number().int().nonnegative(),
    ntag_public_id: z.string(),
  })
)

export { clockTagSummaryRowsSchema }
