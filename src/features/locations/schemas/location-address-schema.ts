import { z } from "zod"

const ukPostcodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i, "Enter a valid UK postcode.")

const locationAddressSchema = z.object({
  line1: z.string().trim().min(3, "Enter the first address line.").max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2, "Enter a town or city.").max(80),
  county: z.string().trim().max(80).optional(),
  postcode: ukPostcodeSchema,
  country: z.literal("GB"),
})

type LocationAddress = z.infer<typeof locationAddressSchema>

export { locationAddressSchema, ukPostcodeSchema }
export type { LocationAddress }
