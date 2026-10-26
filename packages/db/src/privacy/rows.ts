import { z } from "zod"
import {
  privacyStatusSchema,
  privacySummarySchema,
} from "@rocketrota/shared/privacy"

const requestColumns = `id, status, requested_at, due_at, expires_at, public_message, revision`
const requestRowSchema = z.object({
  id: z.uuid(),
  status: privacyStatusSchema,
  requested_at: z.coerce.date(),
  due_at: z.coerce.date(),
  expires_at: z.coerce.date().nullable(),
  public_message: z.string(),
  revision: z.number().int(),
})
function mapPrivacyRequest(value: unknown) {
  const row = requestRowSchema.parse(value)
  return privacySummarySchema.parse({
    id: row.id,
    status: row.status,
    requestedAt: row.requested_at.toISOString(),
    dueAt: row.due_at.toISOString(),
    expiresAt: row.expires_at?.toISOString() ?? null,
    message: row.public_message,
    revision: row.revision,
  })
}
export { mapPrivacyRequest, requestColumns }
