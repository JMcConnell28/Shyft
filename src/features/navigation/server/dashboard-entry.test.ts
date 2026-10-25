import { beforeEach, describe, expect, it, vi } from "vitest"

import type { NavigationSession } from "@/features/navigation/types"
import { findLatestPendingJoinRequestId } from "@/features/join-approvals/server/pending-request-id"
import { readDashboardEntry } from "@/features/navigation/server/dashboard-entry"
import { readNavigationSession } from "@/features/navigation/server/navigation-session"
import { getOnboardingIntentForUser } from "@/features/onboarding/server/intent"
import { organizationHasLocation } from "@/features/onboarding/server/organization-location-exists"
import {
  listOrganizationsForHeaders,
  setActiveOrganizationForHeaders,
} from "@/features/onboarding/server/session"

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/features/join-approvals/server/pending-request-id", () => ({
  findLatestPendingJoinRequestId: vi.fn(),
}))
vi.mock("@/features/navigation/server/navigation-session", () => ({
  readNavigationSession: vi.fn(),
}))
vi.mock("@/features/onboarding/server/intent", () => ({
  getOnboardingIntentForUser: vi.fn(),
}))
vi.mock("@/features/onboarding/server/organization-location-exists", () => ({
  organizationHasLocation: vi.fn(),
}))
vi.mock("@/features/onboarding/server/session", () => ({
  listOrganizationsForHeaders: vi.fn(),
  setActiveOrganizationForHeaders: vi.fn(),
}))
vi.mock("@/lib/auth-session.server", () => ({
  getAuthRequestHeaders: () => new Headers(),
}))

const organization = { id: "org-a", name: "Team", slug: "team" }
const session: NavigationSession = {
  sessionId: "session-a",
  user: {
    id: "user-a",
    name: "Alex",
    email: "alex@example.com",
    emailVerified: true,
  },
  activeOrganizationId: "org-a",
  expiresAt: Date.now() + 60_000,
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(readNavigationSession).mockResolvedValue(session)
  vi.mocked(findLatestPendingJoinRequestId).mockResolvedValue(null)
  vi.mocked(listOrganizationsForHeaders).mockResolvedValue([organization])
  vi.mocked(organizationHasLocation).mockResolvedValue(true)
  vi.mocked(getOnboardingIntentForUser).mockResolvedValue("manage")
})

describe("minimal dashboard entry", () => {
  it("checks the session user's request and uses only a location existence read for a ready workspace", async () => {
    expect(await readDashboardEntry()).toMatchObject({
      userId: session.user.id,
      sessionId: session.sessionId,
      destination: { kind: "workspace", workspaceSlug: "team" },
    })
    expect(findLatestPendingJoinRequestId).toHaveBeenCalledWith("user-a")
    expect(organizationHasLocation).toHaveBeenCalledWith("org-a")
    expect(getOnboardingIntentForUser).not.toHaveBeenCalled()
    expect(setActiveOrganizationForHeaders).not.toHaveBeenCalled()
  })

  it("keeps pending joins ahead of workspace selection without changing the active organization", async () => {
    vi.mocked(findLatestPendingJoinRequestId).mockResolvedValue("request-a")
    expect(await readDashboardEntry()).toMatchObject({
      destination: { kind: "join-status", requestId: "request-a" },
    })
    expect(organizationHasLocation).not.toHaveBeenCalled()
    expect(setActiveOrganizationForHeaders).not.toHaveBeenCalled()
  })

  it.each(["manage", "join"] as const)(
    "retains the %s setup destination without memberships",
    async (intent) => {
      vi.mocked(listOrganizationsForHeaders).mockResolvedValue([])
      vi.mocked(getOnboardingIntentForUser).mockResolvedValue(intent)
      expect(await readDashboardEntry()).toMatchObject({
        destination: {
          kind: "onboarding",
          path: intent === "join" ? "/onboarding/join" : "/onboarding/setup",
        },
      })
      expect(organizationHasLocation).not.toHaveBeenCalled()
    }
  )

  it("retains first-location onboarding", async () => {
    vi.mocked(organizationHasLocation).mockResolvedValue(false)
    expect(await readDashboardEntry()).toMatchObject({
      destination: { kind: "onboarding", path: "/onboarding/location" },
    })
  })

  it("selects and activates only an actual membership when the active organization is stale", async () => {
    vi.mocked(readNavigationSession).mockResolvedValue({
      ...session,
      activeOrganizationId: "removed-org",
    })
    expect(await readDashboardEntry()).toMatchObject({
      activeOrganizationId: "org-a",
      destination: { workspaceSlug: "team" },
    })
    expect(setActiveOrganizationForHeaders).toHaveBeenCalledWith(
      expect.any(Headers),
      "org-a"
    )
  })

  it("does not silently fall back after a failed setup read", async () => {
    vi.mocked(organizationHasLocation).mockRejectedValue(
      new Error("Unavailable")
    )
    await expect(readDashboardEntry()).rejects.toThrow("Unavailable")
    expect(setActiveOrganizationForHeaders).not.toHaveBeenCalled()
  })

  it.each([
    null,
    { ...session, expiresAt: 0 },
    { ...session, user: { ...session.user, emailVerified: false } },
  ])(
    "rejects absent, expired or unverified sessions before reading workspace data",
    async (value) => {
      vi.mocked(readNavigationSession).mockResolvedValue(value)
      expect(await readDashboardEntry()).toBeNull()
      expect(listOrganizationsForHeaders).not.toHaveBeenCalled()
      expect(findLatestPendingJoinRequestId).not.toHaveBeenCalled()
    }
  )
})
