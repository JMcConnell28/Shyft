import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest"
import { Pool } from "pg"
import {
  automaticClockOutSql,
  claimClockRemindersSql,
} from "./automatic-clock-out-sql"
import {
  addClockAutomationEntry,
  automationIds,
  seedClockAutomationFixtures,
  temporaryClockSql,
} from "./automatic-clock-out-fixtures"
// eslint-disable-next-line no-duplicate-imports
import type { PoolClient } from "pg"
import {
  CLOCK_OUT_REMINDER_MINUTES,
  SCHEDULED_CLOCK_OUT_DELAY_MINUTES,
  UNSCHEDULED_CLOCK_OUT_LIMIT_MINUTES,
  UNSCHEDULED_CLOCK_OUT_REMINDER_MINUTES,
} from "@/features/time-clock/constants/automatic-clock-out"

describe.skipIf(!process.env.DATABASE_URL)(
  "clock automation against isolated Postgres tables",
  () => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      connectionTimeoutMillis: 15_000,
    })
    let client: PoolClient
    beforeAll(async () => {
      client = await pool.connect()
    })
    beforeEach(async () => {
      await client.query("begin")
      await seedClockAutomationFixtures(client)
    })
    afterEach(async () => {
      await client.query("rollback")
    })
    afterAll(async () => {
      client.release()
      await pool.end()
    })

    async function close(now: string) {
      const result = await client.query<{ closed: number }>(
        temporaryClockSql(automaticClockOutSql),
        [
          now,
          SCHEDULED_CLOCK_OUT_DELAY_MINUTES,
          UNSCHEDULED_CLOCK_OUT_LIMIT_MINUTES,
          100,
        ]
      )
      return result.rows[0].closed
    }
    async function claim(now: string) {
      return (
        await client.query(temporaryClockSql(claimClockRemindersSql), [
          now,
          CLOCK_OUT_REMINDER_MINUTES,
          SCHEDULED_CLOCK_OUT_DELAY_MINUTES,
          UNSCHEDULED_CLOCK_OUT_LIMIT_MINUTES,
          5,
          100,
          UNSCHEDULED_CLOCK_OUT_REMINDER_MINUTES,
        ])
      ).rows
    }

    it("closes at the two-hour boundary, preserves the estimate and audit, and does not repeat", async () => {
      const id = await addClockAutomationEntry(
        client,
        "2026-10-18T08:00:00Z",
        "2026-10-18T16:00:00Z"
      )
      expect(await close("2026-10-18T17:59:59Z")).toBe(0)
      expect(await close("2026-10-18T18:00:00Z")).toBe(1)
      const entry = (
        await client.query(`select * from pg_temp.time_entries where id = $1`, [
          id,
        ])
      ).rows[0]
      expect(entry.clocked_out_at.toISOString()).toBe(
        "2026-10-18T16:00:00.000Z"
      )
      expect(entry.payable_end_at.toISOString()).toBe(
        "2026-10-18T16:00:00.000Z"
      )
      expect(entry.auto_clocked_out_at.toISOString()).toBe(
        "2026-10-18T18:00:00.000Z"
      )
      expect(entry.status).toBe("requires_review")
      expect(entry.source).toBe("employee_nfc")
      expect(entry.notes).toContain("Original note\nAutomatically clocked out")
      expect(await close("2026-10-19T18:00:00Z")).toBe(0)
      const events = (await client.query(`select * from pg_temp.clock_events`))
        .rows
      expect(events).toHaveLength(1)
      expect(events[0].event_type).toBe("auto_clock_out")
      expect(events[0].metadata.estimated_end_at).toContain(
        "2026-10-18T16:00:00"
      )
    })

    it("limits unscheduled entries to eight hours and recovers the correct end after downtime", async () => {
      await addClockAutomationEntry(client, "2026-10-18T08:00:00Z", null)
      expect(await close("2026-10-18T15:59:59Z")).toBe(0)
      expect(await close("2026-10-20T10:00:00Z")).toBe(1)
      const entry = (
        await client.query(
          `select clocked_out_at, status from pg_temp.time_entries`
        )
      ).rows[0]
      expect(entry.clocked_out_at.toISOString()).toBe(
        "2026-10-18T16:00:00.000Z"
      )
      expect(entry.status).toBe("requires_review")
    })

    it("claims a single reminder at 15 minutes for the employee rather than the manager", async () => {
      await addClockAutomationEntry(
        client,
        "2026-10-18T08:00:00Z",
        "2026-10-18T16:00:00Z"
      )
      expect(await claim("2026-10-18T16:14:59Z")).toHaveLength(0)
      const reminders = await claim("2026-10-18T16:15:00Z")
      expect(reminders).toHaveLength(1)
      expect(reminders[0]).toMatchObject({
        userId: "employee-user",
        workspaceSlug: "team",
        scheduled: true,
      })
      expect(await claim("2026-10-18T16:16:00Z")).toHaveLength(0)
      expect(await claim("2026-10-18T16:20:00Z")).toHaveLength(1)
      await client.query(
        `update pg_temp.time_entries set clock_out_reminder_sent_at = '2026-10-18T16:20:00Z'`
      )
      expect(await claim("2026-10-18T16:30:00Z")).toHaveLength(0)
    })

    it("reminds unscheduled employees 15 minutes before the eight-hour limit", async () => {
      await addClockAutomationEntry(client, "2026-10-18T08:00:00Z", null)
      expect(await claim("2026-10-18T15:44:59Z")).toHaveLength(0)
      expect(await claim("2026-10-18T15:45:00Z")).toHaveLength(1)
      expect(await claim("2026-10-18T16:00:00Z")).toHaveLength(0)
    })

    it("uses custom scheduled settings for reminders and closure", async () => {
      await client.query(
        `insert into pg_temp.location_clock_settings
        (location_id, forgotten_clock_out_alert_minutes, hard_review_after_minutes) values ($1, 30, 180)`,
        [automationIds.location]
      )
      await addClockAutomationEntry(
        client,
        "2026-10-18T08:00:00Z",
        "2026-10-18T16:00:00Z"
      )
      expect(await claim("2026-10-18T16:15:00Z")).toHaveLength(0)
      expect(await claim("2026-10-18T16:30:00Z")).toHaveLength(1)
      expect(await close("2026-10-18T18:00:00Z")).toBe(0)
      expect(await close("2026-10-18T19:00:00Z")).toBe(1)
    })

    it("uses a custom unscheduled maximum and reminder lead", async () => {
      await client.query(
        `insert into pg_temp.location_clock_settings
        (location_id, forgotten_clock_out_alert_minutes, hard_review_after_minutes,
         unscheduled_clock_out_after_minutes, unscheduled_clock_out_reminder_minutes)
        values ($1, 15, 120, 720, 30)`,
        [automationIds.location]
      )
      await addClockAutomationEntry(client, "2026-10-18T08:00:00Z", null)
      expect(await close("2026-10-18T16:00:00Z")).toBe(0)
      expect(await claim("2026-10-18T19:29:59Z")).toHaveLength(0)
      expect(await claim("2026-10-18T19:30:00Z")).toMatchObject([
        { limitMinutes: 720 },
      ])
      expect(await close("2026-10-18T20:00:00Z")).toBe(1)
      const entry = (
        await client.query<{ clocked_out_at: Date }>(
          `select clocked_out_at from pg_temp.time_entries`
        )
      ).rows[0]
      expect(entry.clocked_out_at.toISOString()).toBe(
        "2026-10-18T20:00:00.000Z"
      )
    })

    it("keeps timings scoped to the entry's location", async () => {
      await client.query(`insert into pg_temp.location_clock_settings
        (location_id, forgotten_clock_out_alert_minutes, hard_review_after_minutes)
        values ('20000000-0000-4000-8000-000000000099', 30, 180)`)
      await addClockAutomationEntry(
        client,
        "2026-10-18T08:00:00Z",
        "2026-10-18T16:00:00Z"
      )
      expect(await claim("2026-10-18T16:15:00Z")).toHaveLength(1)
      expect(await close("2026-10-18T18:00:00Z")).toBe(1)
    })

    it("enforces reminder ordering at the database boundary", async () => {
      await expect(
        client.query(
          `insert into pg_temp.location_clock_settings
        (location_id, forgotten_clock_out_alert_minutes, hard_review_after_minutes)
        values ($1, 120, 120)`,
          [automationIds.location]
        )
      ).rejects.toThrow("scheduled_reminder_before_close_check")
    })

    it.each([
      ["2026-10-18T22:00:00Z", "2026-10-19T06:00:00Z", "2026-10-19T08:00:00Z"],
      [
        "2026-10-25T00:00:00+01:00",
        "2026-10-25T06:00:00Z",
        "2026-10-25T08:00:00Z",
      ],
      ["2026-10-18T08:00:00Z", "2026-10-18T20:00:00Z", "2026-10-18T22:00:00Z"],
    ])(
      "uses the captured end for overnight, DST and long scheduled shifts (%s)",
      async (start, end, cutoff) => {
        await addClockAutomationEntry(client, start, end)
        expect(await close(end)).toBe(0)
        expect(await close(cutoff)).toBe(1)
      }
    )
  }
)
