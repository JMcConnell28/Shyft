import { z } from "zod"

const generateClockStationTagInputSchema = z.object({
  locationId: z.uuid(),
})

export { generateClockStationTagInputSchema }
