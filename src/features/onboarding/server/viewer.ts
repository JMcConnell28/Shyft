import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

import type { ViewerState } from "@/features/onboarding/types"
import { auth } from "@/lib/auth"
import { isEmailVerificationSatisfied } from "@/lib/email-verification"
import { organizationRouteParamsSchema } from "@/lib/onboarding-schemas"

import {
  listOrganizationsForHeaders,
  setActiveOrganizationForHeaders,
} from "@/features/onboarding/server/session"
import { getActiveOrganizationState } from "@/features/onboarding/server/state"

const getViewerState = createServerFn({ method: "GET" }).handler(
  async (): Promise<ViewerState | null> => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session) {
      return null
    }

    const organizations = await listOrganizationsForHeaders(headers)
    const activeOrganizationId = session.session.activeOrganizationId ?? null
    const activeOrganization =
      organizations.find((organization) => organization.id === activeOrganizationId) ??
      null

    if (!activeOrganizationId || !activeOrganization) {
      return {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          emailVerified: isEmailVerificationSatisfied(
            session.user.emailVerified,
          ),
        },
        activeOrganizationId,
        organizations,
        activeOrganization: null,
        onboarding: null,
        locations: [],
        staffGroups: [],
      }
    }

    const { onboarding, locations, staffGroups } =
      await getActiveOrganizationState(activeOrganizationId)

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        emailVerified: isEmailVerificationSatisfied(session.user.emailVerified),
      },
      activeOrganizationId,
      organizations,
      activeOrganization,
      onboarding,
      locations,
      staffGroups,
    }
  },
)

const getViewerStateForOrganizationSlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => organizationRouteParamsSchema.parse(input))
  .handler(async ({ data }): Promise<ViewerState | null> => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session) {
      return null
    }

    const organizations = await listOrganizationsForHeaders(headers)
    const activeOrganization =
      organizations.find((organization) => organization.slug === data.orgSlug) ??
      null

    if (!activeOrganization) {
      return null
    }

    if (session.session.activeOrganizationId !== activeOrganization.id) {
      await setActiveOrganizationForHeaders(headers, activeOrganization.id)
    }

    const { onboarding, locations, staffGroups } =
      await getActiveOrganizationState(activeOrganization.id)

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        emailVerified: isEmailVerificationSatisfied(session.user.emailVerified),
      },
      activeOrganizationId: activeOrganization.id,
      organizations,
      activeOrganization,
      onboarding,
      locations,
      staffGroups,
    }
  })

export { getViewerState, getViewerStateForOrganizationSlug }
