import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getLocationBillingAccess,
  getOrganizationBillingAccess,
} from "@/features/billing/server/billing-accounts"
import { getWorkspaceTrial } from "@/features/billing/server/trials"
import { readNavigationSession } from "@/features/navigation/server/navigation-session"
import { readWorkspaceViewer } from "@/features/navigation/server/workspace-viewer"
import {
  listLocationWorkspacesForUser,
  listOrganizationsForHeaders,
} from "@/features/onboarding/server/session"
import { getLocationRole } from "@/lib/auth/has-location-permission"
import { getOrganizationRole } from "@/lib/auth/has-org-permission"

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/features/navigation/server/navigation-session", () => ({
  readNavigationSession: vi.fn(),
}))
vi.mock("@/features/onboarding/server/session", () => ({
  listLocationWorkspacesForUser: vi.fn(),
  listOrganizationsForHeaders: vi.fn(),
}))
vi.mock("@/lib/auth-session.server", () => ({
  getAuthRequestHeaders: () => new Headers(),
}))
vi.mock("@/features/billing/server/billing-accounts", () => ({
  getLocationBillingAccess: vi.fn(),
  getOrganizationBillingAccess: vi.fn(),
}))
vi.mock("@/features/billing/server/trials", () => ({
  getWorkspaceTrial: vi.fn(),
}))
vi.mock("@/lib/auth/has-location-permission", () => ({
  getLocationRole: vi.fn(),
}))
vi.mock("@/lib/auth/has-org-permission", () => ({
  getOrganizationRole: vi.fn(),
}))

const input = {
  sessionId: "session-a",
  userId: "user-a",
  workspaceSlug: "team",
}
const user = {
  id: "user-a",
  name: "Alex",
  email: "alex@example.com",
  emailVerified: true,
}
const organization = { id: "org-a", name: "Team", slug: "team" }
const location = {
  ...organization,
  id: "location-a",
  type: "location",
  organizationId: null,
} as const

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(readNavigationSession).mockResolvedValue({
    sessionId: input.sessionId,
    expiresAt: Date.now() + 60_000,
    activeOrganizationId: null,
    user,
  })
  vi.mocked(listOrganizationsForHeaders).mockResolvedValue([organization])
  vi.mocked(listLocationWorkspacesForUser).mockResolvedValue([])
  vi.mocked(getOrganizationRole).mockResolvedValue("owner")
  vi.mocked(getLocationRole).mockResolvedValue("employee")
  vi.mocked(getLocationBillingAccess).mockResolvedValue(null)
  vi.mocked(getOrganizationBillingAccess).mockResolvedValue(null)
  vi.mocked(getWorkspaceTrial).mockResolvedValue({
    scope: "organization",
    organizationId: "org-a",
    locationId: null,
    status: "trialing",
    trialStartedAt: "2030-01-01",
    trialEndsAt: "2030-01-15",
  })
})

describe("workspace viewer reads", () => {
  it("resolves an organization with one membership-list pass and no onboarding payload", async () => {
    const result = await readWorkspaceViewer(input)
    expect(result).toMatchObject({
      user,
      activeOrganization: organization,
      activeRole: "owner",
    })
    expect(result).not.toHaveProperty("onboarding")
    expect(result).not.toHaveProperty("staffGroups")
    expect(result).not.toHaveProperty("locations")
    expect(listOrganizationsForHeaders).toHaveBeenCalledTimes(1)
    expect(listLocationWorkspacesForUser).toHaveBeenCalledTimes(1)
    expect(getOrganizationBillingAccess).toHaveBeenCalledWith("org-a")
    expect(getLocationBillingAccess).not.toHaveBeenCalled()
  })

  it("preserves location precedence for colliding workspace slugs", async () => {
    vi.mocked(listLocationWorkspacesForUser).mockResolvedValue([location])
    const result = await readWorkspaceViewer(input)
    expect(result).toMatchObject({
      activeWorkspace: location,
      activeOrganization: null,
      activeRole: "employee",
    })
    expect(getLocationRole).toHaveBeenCalledWith("location-a", "user-a")
    expect(getWorkspaceTrial).toHaveBeenCalledWith({ locationId: "location-a" })
    expect(getOrganizationRole).not.toHaveBeenCalled()
  })

  it("rejects a workspace outside the authenticated user's memberships", async () => {
    expect(
      await readWorkspaceViewer({ ...input, workspaceSlug: "another-team" })
    ).toBeNull()
    expect(getWorkspaceTrial).not.toHaveBeenCalled()
    expect(getOrganizationBillingAccess).not.toHaveBeenCalled()
  })

  it("rejects a removed membership before loading trial or billing data", async () => {
    vi.mocked(getOrganizationRole).mockResolvedValue(null)
    expect(await readWorkspaceViewer(input)).toBeNull()
    expect(getWorkspaceTrial).not.toHaveBeenCalled()
    expect(getOrganizationBillingAccess).not.toHaveBeenCalled()
  })

  it.each([
    { userId: "different-user", sessionId: "session-a" },
    { userId: "user-a", sessionId: "different-session" },
  ])(
    "does not return data under another identity's cache key: %j",
    async (identity) => {
      expect(await readWorkspaceViewer({ ...input, ...identity })).toBeNull()
      expect(listOrganizationsForHeaders).not.toHaveBeenCalled()
      expect(listLocationWorkspacesForUser).not.toHaveBeenCalled()
    }
  )

  it("rejects missing and unverified sessions before querying workspace data", async () => {
    vi.mocked(readNavigationSession)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        sessionId: input.sessionId,
        expiresAt: Date.now() + 60_000,
        activeOrganizationId: null,
        user: { ...user, emailVerified: false },
      })
    expect(await readWorkspaceViewer(input)).toBeNull()
    expect(await readWorkspaceViewer(input)).toBeNull()
    expect(listOrganizationsForHeaders).not.toHaveBeenCalled()
  })
})
