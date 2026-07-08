import { z } from "zod"

const DERRY_CLOCK_STATION_POSTCODE_PREFIXES = ["BT47", "BT48"] as const

const DERRY_CLOCK_STATION_COMING_SOON_MESSAGE =
  "Clock-in stations are coming soon outside Derry. For now, delivery postcodes must begin BT47 or BT48."

const ukPostcodeSchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i, "Enter a valid UK postcode.")

const derryClockStationPostcodeSchema = ukPostcodeSchema.refine(
  isDerryClockStationPostcode,
  DERRY_CLOCK_STATION_COMING_SOON_MESSAGE
)

const timeAttendanceDeliveryAddressSchema = z.object({
  name: z.string().trim().min(2).max(120),
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(80),
  county: z.string().trim().max(80).optional(),
  postcode: derryClockStationPostcodeSchema,
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

function isDerryClockStationPostcode(value: string) {
  const normalizedPostcode = normalizePostcode(value)

  return DERRY_CLOCK_STATION_POSTCODE_PREFIXES.some((prefix) =>
    normalizedPostcode.startsWith(prefix)
  )
}

type TimeAttendanceDeliveryAddress = z.infer<
  typeof timeAttendanceDeliveryAddressSchema
>

export {
  DERRY_CLOCK_STATION_COMING_SOON_MESSAGE,
  DERRY_CLOCK_STATION_POSTCODE_PREFIXES,
  isDerryClockStationPostcode,
  normalizePostcode,
  timeAttendanceAddonInputSchema,
  timeAttendanceDeliveryAddressSchema,
}

export type { TimeAttendanceDeliveryAddress }
