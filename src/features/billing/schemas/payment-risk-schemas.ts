import { z } from "zod"

const referenceSchema = z
  .union([z.string().min(1), z.object({ id: z.string().min(1) })])
  .transform((value) => (typeof value === "string" ? value : value.id))
const riskChargeSchema = z.object({
  id: z.string().startsWith("ch_"),
  customer: referenceSchema.nullable(),
  payment_intent: referenceSchema.nullable(),
  amount: z.number().int().nonnegative(),
  amount_refunded: z.number().int().nonnegative(),
  currency: z.string().length(3),
})
const riskInvoiceSchema = z.object({
  parent: z
    .object({
      subscription_details: z
        .object({ subscription: referenceSchema })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
})

export { riskChargeSchema, riskInvoiceSchema }
