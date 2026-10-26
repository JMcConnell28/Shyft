import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { collectPersonalDataDraft } from "@rocketrota/db/privacy"

vi.mock("@tanstack/react-start/server-only", () => ({}))

describe.skipIf(!process.env.DATABASE_URL)(
  "personal data collection against Postgres",
  () => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      connectionTimeoutMillis: 15000,
    })
    beforeAll(async () => {
      await pool.query("select 1")
    })
    afterAll(async () => {
      await pool.end()
    })

    it("collects only a disposable subject and excludes authentication credentials", async () => {
      const client = await pool.connect()
      const userId = `privacy-test-${randomUUID()}`
      try {
        await client.query("begin isolation level repeatable read")
        await client.query(
          `insert into public."user"(id, name, email, "emailVerified", "createdAt", "updatedAt")
         values ($1, 'Privacy test subject', $2, true, now(), now())`,
          [userId, `${userId}@example.com`]
        )
        const response = await collectPersonalDataDraft(
          client,
          userId,
          randomUUID()
        )
        expect(response.subject.userId).toBe(userId)
        expect(response.sections.length).toBeGreaterThan(25)
        expect(
          response.sections.find(
            (section) => section.title === "Account profile"
          )?.records
        ).toHaveLength(1)
        expect(
          response.sections.find(
            (section) =>
              section.title === "Employee profiles, including former employment"
          )?.records
        ).toEqual([])
        expect(JSON.stringify(response)).not.toMatch(
          /"(?:token|password|accessToken|refreshToken|ntag_aes_key_hex)":/
        )
        expect(response.summary).toContain("REVIEW REQUIRED")
      } finally {
        await client.query("rollback")
        client.release()
      }
    })
  }
)
