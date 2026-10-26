import "@tanstack/react-start/server-only"
import { personalDataResponseSchema } from "@rocketrota/shared/privacy"
import { collectPersonalDataDraft } from "./collection"
import { lockPrivacyRequest } from "./review"
import { withPrivacyTransaction } from "./transaction"
import type { SavePrivacyDraftInput } from "@rocketrota/shared/privacy"

async function preparePrivacyDraft(
  id: string,
  revision: number,
  adminUserId: string
): Promise<void> {
  await withPrivacyTransaction(async (client) => {
    await client.query("set transaction isolation level repeatable read")
    const row = await lockPrivacyRequest(client, id, revision)
    if (!row.user_id)
      throw new Error(
        "This account is no longer linked. Prepare the response using verified historical records and an agreed secure delivery method."
      )
    const response = await collectPersonalDataDraft(client, row.user_id, id)
    if (Buffer.byteLength(JSON.stringify(response)) > 10 * 1024 * 1024)
      throw new Error(
        "Draft exceeds 10 MB; arrange alternative secure delivery."
      )
    await client.query(
      `update privacy_private.data_requests set draft = $2, draft_expires_at = now() + interval '7 days',
       status = 'in_review', revision = revision + 1 where id = $1`,
      [id, JSON.stringify(response)]
    )
    await client.query(
      `insert into privacy_private.data_request_events(request_id, admin_user_id, kind, internal_note)
       values ($1, $2, 'prepared', 'Automated draft prepared; further searches, controller coordination and disclosure review remain required.')`,
      [id, adminUserId]
    )
  })
}

async function savePrivacyDraft(
  input: SavePrivacyDraftInput,
  adminUserId: string
): Promise<void> {
  const response = personalDataResponseSchema.parse(input.response)
  const serialized = JSON.stringify(response)
  if (Buffer.byteLength(serialized) > 10 * 1024 * 1024)
    throw new Error("Draft exceeds 10 MB; arrange alternative secure delivery.")
  await withPrivacyTransaction(async (client) => {
    const row = await lockPrivacyRequest(client, input.id, input.revision)
    if (
      response.requestId !== input.id ||
      response.subject.userId !== row.user_id
    ) {
      throw new Error("The response must belong to this request and account.")
    }
    await client.query(
      `update privacy_private.data_requests set draft = $2, draft_expires_at = now() + interval '7 days',
       revision = revision + 1 where id = $1`,
      [input.id, serialized]
    )
    await client.query(
      `insert into privacy_private.data_request_events(request_id, admin_user_id, kind, internal_note)
       values ($1, $2, 'draft_saved', 'Reviewed draft saved. This does not release it to the requester.')`,
      [input.id, adminUserId]
    )
  })
}
export { preparePrivacyDraft, savePrivacyDraft }
