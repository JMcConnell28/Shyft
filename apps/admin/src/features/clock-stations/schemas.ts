import { z } from "zod"

const generateClockStationTagInputSchema = z.object({
  locationId: z.uuid(),
})

const appBaseUrlSchema = z.url().refine((value) => {
  const protocol = new URL(value).protocol
  return protocol === "https:" || protocol === "http:"
})

export { appBaseUrlSchema, generateClockStationTagInputSchema }
