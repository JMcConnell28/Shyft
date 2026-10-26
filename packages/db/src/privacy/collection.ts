import "@tanstack/react-start/server-only"
import { z } from "zod"
import { personalDataResponseSchema } from "@rocketrota/shared/privacy"
import { accountCollection } from "./collection-account"
import { workforceCollection } from "./collection-workforce"
import { activityCollection } from "./collection-activity"
import type { PoolClient } from "pg"
import type { PersonalDataResponse } from "@rocketrota/shared/privacy"

const subjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
})
const recordsSchema = z.array(z.record(z.string(), z.json()))
const reviewPlaceholder =
  "REVIEW REQUIRED: complete this explanation before release."

async function collectPersonalDataDraft(
  client: PoolClient,
  userId: string,
  requestId: string
): Promise<PersonalDataResponse> {
  const subjectResult = await client.query(
    'select id, name, email from public."user" where id = $1',
    [userId]
  )
  const subject = subjectSchema.parse(subjectResult.rows[0])
  const sections: PersonalDataResponse["sections"] = []
  for (const section of [
    ...accountCollection,
    ...workforceCollection,
    ...activityCollection,
  ]) {
    const { rows } = await client.query(`${section.sql} limit 10001`, [userId])
    if (rows.length > 10000) {
      throw new Error(
        `The ${section.title} section exceeds the preparation limit. Arrange a complete response through an alternative secure delivery method; do not truncate it.`
      )
    }
    // PostgreSQL dates and timestamps become portable JSON values at this boundary.
    sections.push({
      title: section.title,
      records: recordsSchema.parse(JSON.parse(JSON.stringify(rows))),
    })
  }
  return personalDataResponseSchema.parse({
    version: 1,
    requestId,
    generatedAt: new Date().toISOString(),
    subject: { userId: subject.id, name: subject.name, email: subject.email },
    summary: reviewPlaceholder,
    processing: {
      purposes: reviewPlaceholder,
      recipients: reviewPlaceholder,
      retention: reviewPlaceholder,
      sources: reviewPlaceholder,
      rights: reviewPlaceholder,
      internationalTransfers: reviewPlaceholder,
      automatedProcessing: reviewPlaceholder,
    },
    sections,
    scopeAndRedactions: `${reviewPlaceholder} Check historical/unlinked employee profiles, references in other people's notes, billing records, provider/server logs, email correspondence and attachments. Coordinate each employer's instructions. The automated draft is a starting point, not a complete SAR search.`,
  })
}
export { collectPersonalDataDraft }
