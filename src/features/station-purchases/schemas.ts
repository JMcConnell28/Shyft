import { z } from "zod"
import { timeAttendanceDeliveryAddressSchema } from "@/features/billing/schemas/time-attendance-addon-schemas"

const stationLocationSchema = z.object({ locationId: z.uuid() })
const startStationPurchaseSchema = stationLocationSchema.extend({
  purchaseId: z.uuid(),
  returnPath: z
    .string()
    .max(500)
    .regex(/^\/app\/[^?#\\]+\/settings\/billing$/),
  deliveryAddress: timeAttendanceDeliveryAddressSchema,
})
export { stationLocationSchema, startStationPurchaseSchema }
export type StartStationPurchaseInput = z.infer<
  typeof startStationPurchaseSchema
>
