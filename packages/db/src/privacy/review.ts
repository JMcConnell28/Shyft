import { z } from "zod"
import type { PoolClient } from "pg"
import type { PersonalDataResponse } from "@rocketrota/shared/privacy"

const lockedRequestSchema = z.object({
  user_id: z.string().nullable(),
  revision: z.number(),
  status: z.string(),
})
async function lockPrivacyRequest(
  client: PoolClient,
  id: string,
  revision: number
) {
  const { rows } = await client.query(
    "select user_id, revision, status from privacy_private.data_requests where id = $1 for update",
    [id]
  )
  if (!rows[0]) throw new Error("This request could not be found.")
  const row = lockedRequestSchema.parse(rows[0])
  if (row.revision !== revision)
    throw new Error("This request changed. Refresh before saving.")
  if (row.status === "ready" || row.status === "completed") {
    throw new Error(
      "A released or completed request cannot be changed. Revoke its download before reopening it."
    )
  }
  return row
}

function assertResponseForRelease(response: PersonalDataResponse): void {
  const serialized = JSON.stringify(response)
  if (Buffer.byteLength(serialized, "utf8") > 10 * 1024 * 1024) {
    throw new Error(
      "This response exceeds 10 MB. Arrange an alternative secure delivery method."
    )
  }
  if (serialized.includes("REVIEW REQUIRED"))
    throw new Error("Complete all review explanations before release.")
  const pending: Array<{ value: unknown; depth: number }> = [
    { value: response, depth: 0 },
  ]
  const secretKeys =
    /^(password|token|accessToken|refreshToken|idToken|secret|privateKey|auth_key|p256dh_key|ntag_aes_key_hex|token_hash|encrypted_picc_hex|cmac_hex)$/i
  while (pending.length) {
    const item = pending.pop()
    if (!item || !item.value || typeof item.value !== "object") continue
    if (item.depth > 30) throw new Error("Response nesting is too deep.")
    for (const [key, value] of Object.entries(item.value)) {
      if (secretKeys.test(key))
        throw new Error(
          "Remove authentication credentials and secret fields before release."
        )
      pending.push({ value, depth: item.depth + 1 })
    }
  }
}
export { assertResponseForRelease, lockPrivacyRequest }
