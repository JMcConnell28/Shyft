import { z } from "zod"

const privacyStatusSchema = z.enum([
  "requested",
  "in_review",
  "awaiting_workplace",
  "ready",
  "completed",
  "expired",
])
const requestPersonalDataSchema = z
  .object({
    confirmed: z.literal(true),
  })
  .strict()
const privacyIdSchema = z.object({ id: z.uuid() }).strict()
const privacyListSchema = z
  .object({ page: z.number().int().min(0).default(0) })
  .strict()
const privacySummarySchema = z.object({
  id: z.uuid(),
  status: privacyStatusSchema,
  requestedAt: z.iso.datetime(),
  dueAt: z.iso.datetime(),
  expiresAt: z.iso.datetime().nullable(),
  message: z.string(),
  revision: z.number().int(),
})
const responseText = z.string().trim().min(1).max(20000)
const personalDataResponseSchema = z
  .object({
    version: z.literal(1),
    requestId: z.uuid(),
    generatedAt: z.iso.datetime(),
    subject: z
      .object({ userId: z.string().min(1), name: z.string(), email: z.email() })
      .strict(),
    summary: responseText,
    processing: z
      .object({
        purposes: responseText,
        recipients: responseText,
        retention: responseText,
        sources: responseText,
        rights: responseText,
        internationalTransfers: responseText,
        automatedProcessing: responseText,
      })
      .strict(),
    sections: z
      .array(
        z
          .object({
            title: responseText,
            records: z.array(z.record(z.string(), z.json())).max(10000),
          })
          .strict()
      )
      .max(80),
    scopeAndRedactions: responseText,
  })
  .strict()
const privacyRevisionSchema = privacyIdSchema.extend({
  revision: z.number().int().min(0),
})
const savePrivacyDraftSchema = privacyRevisionSchema.extend({
  response: personalDataResponseSchema,
})
const updatePrivacyRequestSchema = privacyRevisionSchema
  .extend({
    status: z.enum(["in_review", "awaiting_workplace", "completed"]),
    message: z.string().trim().min(5).max(2000),
    internalNote: z.string().trim().max(4000).default(""),
    extendedDueAt: z.iso.datetime().optional(),
    extensionReason: z.string().trim().min(10).max(2000).optional(),
  })
  .refine(
    (value) => Boolean(value.extendedDueAt) === Boolean(value.extensionReason),
    {
      message: "A deadline extension requires both a date and an explanation.",
    }
  )
const releasePrivacyResponseSchema = privacyRevisionSchema.extend({
  identityChecked: z.literal(true),
  workplaceAuthorityChecked: z.literal(true),
  thirdPartyDataReviewed: z.literal(true),
  externalSourcesChecked: z.literal(true),
})
const downloadPrivacyResponseSchema = privacyIdSchema.extend({
  format: z.enum(["json", "html"]),
})
const recordPrivacyRequestSchema = z
  .object({
    userId: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).max(200),
    email: z.email(),
    receivedAt: z.iso
      .datetime()
      .refine(
        (value) => new Date(value).getTime() <= Date.now(),
        "Received date cannot be in the future."
      ),
    note: z.string().trim().min(10).max(4000),
    identityConfirmed: z.literal(true),
  })
  .strict()

export {
  recordPrivacyRequestSchema,
  downloadPrivacyResponseSchema,
  personalDataResponseSchema,
  privacyIdSchema,
  privacyListSchema,
  privacyRevisionSchema,
  privacyStatusSchema,
  privacySummarySchema,
  releasePrivacyResponseSchema,
  requestPersonalDataSchema,
  savePrivacyDraftSchema,
  updatePrivacyRequestSchema,
}
