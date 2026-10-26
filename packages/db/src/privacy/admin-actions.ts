import "@tanstack/react-start/server-only"
import {
  personalDataResponseSchema,
  releasePrivacyResponseSchema,
  updatePrivacyRequestSchema,
} from "@rocketrota/shared/privacy"
import { assertResponseForRelease, lockPrivacyRequest } from "./review"
import { withPrivacyTransaction } from "./transaction"
import type {
  ReleasePrivacyResponseInput,
  UpdatePrivacyRequestInput,
} from "@rocketrota/shared/privacy"

async function updatePrivacyRequest(
  raw: UpdatePrivacyRequestInput,
  adminUserId: string
): Promise<void> {
  const input = updatePrivacyRequestSchema.parse(raw)
  if (input.status === "completed" && input.internalNote.length < 10) {
    throw new Error(
      "Record how the response was securely delivered or why the request was concluded."
    )
  }
  await withPrivacyTransaction(async (client) => {
    await lockPrivacyRequest(client, input.id, input.revision)
    const { rowCount } = await client.query(
      `update privacy_private.data_requests set status = $2, public_message = $3,
       due_at = coalesce($4::timestamptz, due_at), revision = revision + 1,
       draft = case when $2 = 'completed' then null else draft end
       where id = $1 and ($4::timestamptz is null or
         (now() <= original_due_at and $4::timestamptz > due_at and $4::timestamptz <= original_due_at + interval '2 months'))`,
      [input.id, input.status, input.message, input.extendedDueAt ?? null]
    )
    if (!rowCount)
      throw new Error(
        "Extensions must be notified within the initial deadline and cannot exceed two further months."
      )
    const message = input.extensionReason
      ? `${input.message}\nDeadline extension: ${input.extensionReason}`
      : input.message
    await client.query(
      `insert into privacy_private.data_request_events(request_id, admin_user_id, kind, public_message, internal_note, notify_user)
       values ($1, $2, 'updated', $3, $4, true)`,
      [input.id, adminUserId, message, input.internalNote]
    )
  })
}

async function releasePrivacyResponse(
  raw: ReleasePrivacyResponseInput,
  adminUserId: string
): Promise<void> {
  const input = releasePrivacyResponseSchema.parse(raw)
  await withPrivacyTransaction(async (client) => {
    const locked = await lockPrivacyRequest(client, input.id, input.revision)
    const { rows } = await client.query(
      "select draft from privacy_private.data_requests where id = $1 and draft_expires_at > now()",
      [input.id]
    )
    const response = personalDataResponseSchema.parse(rows[0]?.draft)
    if (
      !locked.user_id ||
      response.subject.userId !== locked.user_id ||
      response.requestId !== input.id
    ) {
      throw new Error(
        "The response must belong to the linked account and request."
      )
    }
    assertResponseForRelease(response)
    await client.query(
      `update privacy_private.data_requests set status = 'ready', released_response = draft,
       released_at = now(), expires_at = now() + interval '7 days', draft = null, draft_expires_at = null,
       public_message = 'Your reviewed response is ready. Download it within seven days, or contact us for help accessing another copy.',
       revision = revision + 1 where id = $1`,
      [input.id]
    )
    await client.query(
      `insert into privacy_private.data_request_events(request_id, admin_user_id, kind, public_message, internal_note, notify_user)
       values ($1, $2, 'released', 'Your personal data response is ready to download in Account → Privacy & data.',
       'Identity, employer authority, third-party disclosure and external-source searches confirmed by the releasing administrator.', true)`,
      [input.id, adminUserId]
    )
  })
}

async function revokePrivacyResponse(
  id: string,
  revision: number,
  adminUserId: string
): Promise<void> {
  await withPrivacyTransaction(async (client) => {
    const { rowCount } = await client.query(
      `update privacy_private.data_requests set status = 'expired', released_response = null,
       expires_at = null, revision = revision + 1,
       public_message = 'We are reviewing your response again. Please contact us if you need assistance.'
       where id = $1 and revision = $2 and status = 'ready'`,
      [id, revision]
    )
    if (!rowCount)
      throw new Error("This response changed. Refresh before revoking it.")
    await client.query(
      `insert into privacy_private.data_request_events(request_id, admin_user_id, kind, public_message, notify_user)
       values ($1, $2, 'updated', 'Your download has been withdrawn for further review. Contact us for assistance.', true)`,
      [id, adminUserId]
    )
  })
}
export { releasePrivacyResponse, revokePrivacyResponse, updatePrivacyRequest }
export { preparePrivacyDraft, savePrivacyDraft } from "./admin-drafts"
