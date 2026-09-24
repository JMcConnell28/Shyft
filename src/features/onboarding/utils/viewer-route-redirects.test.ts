import { describe, expect, it } from "vitest"

import type { ActiveOnboardingState } from "@/features/onboarding/types"
import { getOrganizationAppRedirect } from "@/features/onboarding/utils/viewer-route-redirects"

const organization = { id: "org-a", name: "Team", slug: "team" }
const workspace = {
  ...organization,
  type: "organization" as const,
  organizationId: organization.id,
}
const completedOnboarding: ActiveOnboardingState = {
  organizationId: organization.id,
  trialStartedAt: null,
  trialEndsAt: null,
  completedAt: "2030-01-01T00:00:00.000Z",
  lastStep: "complete",
  hasLocation: true,
  hasZone: false,
  hasInviteLink: false,
}

describe("dashboard onboarding redirect", () => {
  it("resumes first-location setup for an organization without a location", () => {
    expect(
      getOrganizationAppRedirect(
        {
          activeOrganization: organization,
          activeWorkspace: workspace,
          onboarding: {
            ...completedOnboarding,
            completedAt: null,
            lastStep: "location",
            hasLocation: false,
          },
        },
        "dashboard"
      )
    ).toBe("/onboarding/location")
  })

  it("opens the dashboard after required setup is complete", () => {
    expect(
      getOrganizationAppRedirect(
        {
          activeOrganization: organization,
          activeWorkspace: workspace,
          onboarding: completedOnboarding,
        },
        "dashboard"
      )
    ).toBe("/w/team/dashboard")
  })

  it("opens an existing location workspace after required setup", () => {
    expect(
      getOrganizationAppRedirect(
        {
          activeOrganization: null,
          activeWorkspace: {
            id: "location-a",
            name: "Store",
            slug: "store",
            type: "location",
            organizationId: null,
          },
          onboarding: null,
        },
        "dashboard"
      )
    ).toBe("/w/store/dashboard")
  })
})
