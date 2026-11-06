import { Pool } from "pg"
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"
import { getDatabaseConnectionConfig } from "@rocketrota/db/connection-config"
import { createStaffJoinRequest, decideStaffJoinRequest } from "./actions"
import {
  createJoinLocationFixtures,
  fixtureClient,
  foreignLocation,
  groupId,
  locationA,
  locationB,
} from "./join-location-fixtures"
// eslint-disable-next-line no-duplicate-imports
import type { PoolClient } from "pg"
import { createStaffInviteLink } from "@/features/onboarding/server/staff-invite-create"
import { roles } from "@/lib/auth/permissions"

const mocks = vi.hoisted(
  (): { connect: ReturnType<typeof vi.fn>; role: keyof typeof roles } => ({
    connect: vi.fn(),
    role: "owner",
  })
)
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ connect: mocks.connect }) }))
vi.mock("@/features/onboarding/server/session", () => ({
  requireVerifiedSessionOrThrow: () =>
    Promise.resolve({ session: { user: { id: "reviewer" } } }),
}))
vi.mock("@/features/onboarding/server/state", () => ({
  upsertOnboardingState: vi.fn(),
}))
vi.mock("@/features/billing/server/workspace-write-access", () => ({
  requireWorkspaceWriteAccess: vi.fn(),
}))
vi.mock("@/features/billing/server/subscriptions", () => ({
  syncWorkspaceBillingSubscriptionQuantities: vi.fn(),
}))
vi.mock("@/lib/auth/has-org-permission", () => ({
  requireOrgPermission: ({
    permissions,
  }: {
    permissions: Parameters<typeof roles.owner.authorize>[0]
  }) => {
    if (!roles[mocks.role].authorize(permissions).success)
      throw new Error("Permission denied")
  },
}))

describe.skipIf(!process.env.DATABASE_URL)(
  "organization joins in Postgres temporary fixtures",
  () => {
    const pool = new Pool({
      ...(process.env.DATABASE_URL
        ? getDatabaseConnectionConfig(process.env.DATABASE_URL)
        : {}),
      max: 1,
      connectionTimeoutMillis: 15_000,
    })
    let connection: PoolClient | undefined
    let client: PoolClient
    beforeAll(async () => {
      connection = await pool.connect()
      await createJoinLocationFixtures(connection)
      client = fixtureClient(connection)
      mocks.connect.mockResolvedValue(client)
    })
    beforeEach(() => {
      mocks.role = "owner"
    })
    afterAll(async () => {
      connection?.release()
      await pool.end()
    })

    async function requestJoin(token: string, userId: string) {
      const invite = await client.query<{ id: string }>(
        `select id from public.staff_invite_links where token = $1`,
        [token]
      )
      await client.query(
        `insert into public."user" values ($1, 'Applicant', 'applicant@example.com', '1990-01-01') on conflict do nothing`,
        [userId]
      )
      return createStaffJoinRequest({
        inviteLinkId: invite.rows[0].id,
        organizationId: "org",
        userId,
      })
    }
    async function assignments(userId: string) {
      const result = await client.query<{ location_id: string }>(
        `select assignment.location_id
      from public.employee_location_assignments assignment join public.employees employee on employee.id = assignment.employee_id
      where employee.user_id = $1 and assignment.is_enabled order by assignment.location_id`,
        [userId]
      )
      return result.rows.map((row) => row.location_id)
    }
    it("backfills a legacy single-location invite and approves it", async () => {
      const requestId = await requestJoin("legacy", "legacy-user")
      await decideStaffJoinRequest({
        organizationId: "org",
        requestId,
        decision: "approved",
      })
      expect(await assignments("legacy-user")).toEqual([locationA])
    })
    it.each([
      { locationIds: [] },
      { locationIds: [locationA] },
      { locationIds: [locationA, locationB] },
    ])(
      "approves exactly the selected locations: %j",
      async ({ locationIds }) => {
        const invite = await createStaffInviteLink({
          organizationId: "org",
          locationIds,
          defaultStaffGroupId: groupId,
        })
        const userId = `user-${locationIds.length}`
        const requestId = await requestJoin(invite.token, userId)
        expect(await requestJoin(invite.token, userId)).toBe(requestId)
        expect(await assignments(userId)).toEqual([])
        // Replacement must not change the locations on a submitted request.
        const replacement = await createStaffInviteLink({
          organizationId: "org",
          locationIds: [locationB],
          defaultStaffGroupId: groupId,
        })
        expect(await requestJoin(replacement.token, userId)).toBe(requestId)
        mocks.role = "admin"
        await decideStaffJoinRequest({
          organizationId: "org",
          requestId,
          decision: "approved",
        })
        expect(await assignments(userId)).toEqual(locationIds)
        const member = await client.query(
          `select role from public."member" where "userId" = $1`,
          [userId]
        )
        expect(member.rows[0]?.role).toBe("employee")
      }
    )
    it("rejects locations from a different organization without replacing the active link", async () => {
      await expect(
        createStaffInviteLink({
          organizationId: "org",
          locationIds: [foreignLocation],
          defaultStaffGroupId: groupId,
        })
      ).rejects.toThrow("from this organization")
      expect(
        (
          await client.query(
            `select id from public.staff_invite_links where disabled_at is null`
          )
        ).rows
      ).toHaveLength(1)
    })
    it.each(["manager", "supervisor"] as const)(
      "rejects %s organization approvals before accessing the database",
      async (role) => {
        mocks.role = role
        mocks.connect.mockClear()
        await expect(
          decideStaffJoinRequest({
            organizationId: "org",
            requestId: "request",
            decision: "approved",
          })
        ).rejects.toThrow("Permission denied")
        expect(mocks.connect).not.toHaveBeenCalled()
      }
    )
  }
)
