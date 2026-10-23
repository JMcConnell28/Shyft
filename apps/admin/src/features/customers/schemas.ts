import { z } from "zod"

const customerIdSchema = z
  .string()
  .max(180)
  .regex(/^(org:.+|account:[0-9a-f-]{36})$/)
const customerStages = [
  "onboarding",
  "trial",
  "trial_expired",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
  "paused",
  "incomplete_expired",
] as const
const customerListSchema = z.object({
  search: z.string().trim().max(120).default(""),
  stage: z.enum(["all", ...customerStages]).default("all"),
  page: z.number().int().min(1).max(100000).default(1),
})
const customerDetailSchema = z.object({ id: customerIdSchema })
const stationRequestIdSchema = z
  .string()
  .regex(/^(included|additional):[0-9a-f-]{36}$/i)
  .refine((id) => z.uuid().safeParse(id.split(":")[1]).success)
const setupStationTagSchema = z.object({
  requestId: stationRequestIdSchema,
  tagId: z.uuid().optional(),
})
const updateFulfillmentSchema = z.object({
  requestId: stationRequestIdSchema,
  expectedStatus: z.enum([
    "pending",
    "ready",
    "shipped",
    "delivered",
    "failed",
  ]),
  status: z.enum(["pending", "ready", "shipped", "delivered", "failed"]),
  reference: z.string().trim().max(200).default(""),
  notes: z.string().trim().max(2000).default(""),
})

export {
  stationRequestIdSchema,
  setupStationTagSchema,
  customerIdSchema,
  customerListSchema,
  customerDetailSchema,
  customerStages,
  updateFulfillmentSchema,
}
export type CustomerListInput = z.infer<typeof customerListSchema>
export type UpdateFulfillmentInput = z.infer<typeof updateFulfillmentSchema>
