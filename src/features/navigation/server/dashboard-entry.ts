import "@tanstack/react-start/server-only"

import type { DashboardEntry } from "@/features/navigation/types/dashboard-entry"
import { findLatestPendingJoinRequestId } from "@/features/join-approvals/server/pending-request-id"
import { readNavigationSession } from "@/features/navigation/server/navigation-session"
import { getOnboardingIntentForUser } from "@/features/onboarding/server/intent"
import { organizationHasLocation } from "@/features/onboarding/server/organization-location-exists"
import {
  listOrganizationsForHeaders,
  setActiveOrganizationForHeaders,
} from "@/features/onboarding/server/session"
import { getAuthRequestHeaders } from "@/lib/auth-session.server"

async function readDashboardEntry(): Promise<DashboardEntry | null> {
  const session = await readNavigationSession()
  if (!session?.user.emailVerified || session.expiresAt <= Date.now()) return null

  const identity = {
    sessionId: session.sessionId,
    userId: session.user.id,
    activeOrganizationId: session.activeOrganizationId,
  }
  const headers = getAuthRequestHeaders()
  const [requestId, organizations] = await Promise.all([
    findLatestPendingJoinRequestId(session.user.id),
    listOrganizationsForHeaders(headers),
  ])
  if (requestId) {
    return { ...identity, destination: { kind: "join-status", requestId } }
  }

  const organization =
    organizations.find((item) => item.id === session.activeOrganizationId) ??
    organizations.at(0)
  if (!organization) {
    const intent = await getOnboardingIntentForUser(session.user.id)
    return {
      ...identity,
      destination: {
        kind: "onboarding",
        path: intent === "join" ? "/onboarding/join" : "/onboarding/setup",
      },
    }
  }

  const hasLocation = await organizationHasLocation(organization.id)
  if (organization.id !== session.activeOrganizationId) {
    await setActiveOrganizationForHeaders(headers, organization.id)
  }
  return {
    ...identity,
    activeOrganizationId: organization.id,
    destination: hasLocation
      ? { kind: "workspace", workspaceSlug: organization.slug }
      : { kind: "onboarding", path: "/onboarding/location" },
  }
}

export { readDashboardEntry }
