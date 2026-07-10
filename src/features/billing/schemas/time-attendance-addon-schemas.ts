import { z } from "zod"

const SUPPORTED_CLOCK_STATION_POSTCODE_PREFIXES = ["BT47", "BT48"] as const

const CLOCK_STATION_REGION_UNAVAILABLE_MESSAGE =
  "Clock-in stations are currently unavailable in this region."

const ukPostcodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i, "Enter a valid UK postcode.")

const supportedClockStationPostcodeSchema = ukPostcodeSchema.refine(
  isSupportedClockStationPostcode,
  CLOCK_STATION_REGION_UNAVAILABLE_MESSAGE
)

const timeAttendanceDeliveryAddressSchema = z.object({
  name: z.string().trim().min(2).max(120),
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(80),
  county: z.string().trim().max(80).optional(),
  postcode: supportedClockStationPostcodeSchema,
  country: z.literal("GB"),
})

const timeAttendanceAddonInputSchema = z.object({
  locationId: z.string().uuid(),
  action: z.enum(["activate", "cancel", "keep"]),
  confirmationAccepted: z.boolean().optional(),
  deliveryAddress: timeAttendanceDeliveryAddressSchema.optional(),
})

function normalizePostcode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "")
}

function isSupportedClockStationPostcode(value: string) {
  const normalizedPostcode = normalizePostcode(value)

  return SUPPORTED_CLOCK_STATION_POSTCODE_PREFIXES.some((prefix) =>
    normalizedPostcode.startsWith(prefix)
  )
}

type TimeAttendanceDeliveryAddress = z.infer<
  typeof timeAttendanceDeliveryAddressSchema
>

export {
  CLOCK_STATION_REGION_UNAVAILABLE_MESSAGE,
  SUPPORTED_CLOCK_STATION_POSTCODE_PREFIXES,
  isSupportedClockStationPostcode,
  normalizePostcode,
  timeAttendanceAddonInputSchema,
  timeAttendanceDeliveryAddressSchema,
}

export type { TimeAttendanceDeliveryAddress }
