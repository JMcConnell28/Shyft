import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import type {
  OrganizationSummary,
  ViewerState,
  WorkspaceSummary,
} from "@/features/onboarding/types"
import { isEmailVerificationSatisfied } from "@/lib/email-verification"
import { organizationRouteParamsSchema } from "@/lib/onboarding-schemas"

import {
  getLocationBillingAccess,
  getOrganizationBillingAccess,
} from "@/features/billing/server/billing-accounts"
import {
  listLocationWorkspacesForUser,
  listOrganizationsForHeaders,
  setActiveOrganizationForHeaders,
} from "@/features/onboarding/server/session"
import { getOnboardingIntentForUser } from "@/features/onboarding/server/intent"
import {
  getActiveLocationState,
  getActiveOrganizationState,
} from "@/features/onboarding/server/state"
import {
  getAuthRequestHeaders,
  readSessionFromRequestHeaders,
} from "@/lib/auth-session.server"
import type { AuthSession } from "@/lib/auth-session.server"

function buildUser(session: AuthSession) {
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    emailVerified: isEmailVerificationSatisfied(session.user.emailVerified),
  }
}

function organizationWorkspaces(
  organizations: Array<OrganizationSummary>
): Array<WorkspaceSummary> {
  return organizations.map((organization) => ({
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    type: "organization",
    organizationId: organization.id,
  }))
}

const getViewerState = createServerFn({ method: "GET" }).handler(
  async (): Promise<ViewerState | null> => {
    const headers = getAuthRequestHeaders()
    const session = await readSessionFromRequestHeaders()

    if (!session) {
      return null
    }

    const [organizations, locationWorkspaces, onboardingIntent] =
      await Promise.all([
        listOrganizationsForHeaders(headers),
        listLocationWorkspacesForUser(session.user.id),
        getOnboardingIntentForUser(session.user.id),
      ])
    const activeOrganizationId = session.session.activeOrganizationId ?? null
    const activeOrganization =
      organizations.find(
        (organization) => organization.id === activeOrganizationId
      ) ?? null
    const selectedOrganization =
      activeOrganization ?? organizations.at(0) ?? null
    const workspaces = [
      ...locationWorkspaces,
      ...organizationWorkspaces(organizations),
    ]
    const user = buildUser(session)

    if (selectedOrganization) {
      if (activeOrganizationId !== selectedOrganization.id) {
        await setActiveOrganizationForHeaders(headers, selectedOrganization.id)
      }

      const activeState = await getActiveOrganizationState(
        selectedOrganization.id
      )
      const billing = await getOrganizationBillingAccess(
        selectedOrganization.id
      )

      return {
        user,
        activeOrganizationId: selectedOrganization.id,
        organizations,
        activeOrganization: selectedOrganization,
        activeWorkspace: {
          id: selectedOrganization.id,
          name: selectedOrganization.name,
          slug: selectedOrganization.slug,
          type: "organization",
          organizationId: selectedOrganization.id,
        },
        workspaces,
        onboarding: activeState.onboarding,
        trial: activeState.trial,
        billing,
        onboardingIntent,
        locations: activeState.locations,
        staffGroups: activeState.staffGroups,
      }
    }

    const activeLocationWorkspace =
      locationWorkspaces.find(
        (workspace) => workspace.organizationId === null
      ) ??
      locationWorkspaces.at(0) ??
      null

    if (activeLocationWorkspace) {
      const activeState = await getActiveLocationState(
        activeLocationWorkspace.id
      )
      const billing = await getLocationBillingAccess(activeLocationWorkspace.id)

      return {
        user,
        activeOrganizationId,
        organizations,
        activeOrganization: null,
        activeWorkspace: activeLocationWorkspace,
        workspaces,
        onboarding: activeState.onboarding,
        trial: activeState.trial,
        billing,
        onboardingIntent,
        locations: activeState.locations,
        staffGroups: activeState.staffGroups,
      }
    }

    return {
      user,
      activeOrganizationId,
      organizations,
      activeOrganization: null,
      activeWorkspace: null,
      workspaces,
      onboarding: null,
      trial: null,
      billing: null,
      onboardingIntent,
      locations: [],
      staffGroups: [],
    }
  }
)

const getViewerStateForLocationSlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        locationSlug: organizationRouteParamsSchema.shape.orgSlug,
      })
      .parse(input)
  )
  .handler(async ({ data }): Promise<ViewerState | null> => {
    const headers = getAuthRequestHeaders()
    const session = await readSessionFromRequestHeaders()

    if (!session) {
      return null
    }

    const [organizations, locationWorkspaces, onboardingIntent] =
      await Promise.all([
        listOrganizationsForHeaders(headers),
        listLocationWorkspacesForUser(session.user.id),
        getOnboardingIntentForUser(session.user.id),
      ])

    const activeWorkspace =
      locationWorkspaces.find(
        (workspace) => workspace.slug === data.locationSlug
      ) ?? null

    if (!activeWorkspace) {
      return null
    }

    const activeState = await getActiveLocationState(activeWorkspace.id)
    const billing = await getLocationBillingAccess(activeWorkspace.id)

    return {
      user: buildUser(session),
      activeOrganizationId: session.session.activeOrganizationId ?? null,
      organizations,
      activeOrganization: null,
      activeWorkspace,
      workspaces: [
        ...locationWorkspaces,
        ...organizationWorkspaces(organizations),
      ],
      onboarding: activeState.onboarding,
      trial: activeState.trial,
      billing,
      onboardingIntent,
      locations: activeState.locations,
      staffGroups: activeState.staffGroups,
    }
  })

const getViewerStateForOrganizationSlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    organizationRouteParamsSchema.parse(input)
  )
  .handler(async ({ data }): Promise<ViewerState | null> => {
    const headers = getAuthRequestHeaders()
    const session = await readSessionFromRequestHeaders()

    if (!session) {
      return null
    }

    const [organizations, locationWorkspaces, onboardingIntent] =
      await Promise.all([
        listOrganizationsForHeaders(headers),
        listLocationWorkspacesForUser(session.user.id),
        getOnboardingIntentForUser(session.user.id),
      ])
    const activeOrganization =
      organizations.find(
        (organization) => organization.slug === data.orgSlug
      ) ?? null

    if (!activeOrganization) {
      return null
    }

    if (session.session.activeOrganizationId !== activeOrganization.id) {
      await setActiveOrganizationForHeaders(headers, activeOrganization.id)
    }

    const activeState = await getActiveOrganizationState(activeOrganization.id)
    const billing = await getOrganizationBillingAccess(activeOrganization.id)

    return {
      user: buildUser(session),
      activeOrganizationId: activeOrganization.id,
      organizations,
      activeOrganization,
      activeWorkspace: {
        id: activeOrganization.id,
        name: activeOrganization.name,
        slug: activeOrganization.slug,
        type: "organization",
        organizationId: activeOrganization.id,
      },
      workspaces: [
        ...locationWorkspaces,
        ...organizationWorkspaces(organizations),
      ],
      onboarding: activeState.onboarding,
      trial: activeState.trial,
      billing,
      onboardingIntent,
      locations: activeState.locations,
      staffGroups: activeState.staffGroups,
    }
  })

const getViewerStateForWorkspaceSlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        workspaceSlug: organizationRouteParamsSchema.shape.orgSlug,
      })
      .parse(input)
  )
  .handler(async ({ data }): Promise<ViewerState | null> => {
    const locationViewer = await getViewerStateForLocationSlug({
      data: {
        locationSlug: data.workspaceSlug,
      },
    })

    if (locationViewer) {
      return locationViewer
    }

    return getViewerStateForOrganizationSlug({
      data: {
        orgSlug: data.workspaceSlug,
      },
    })
  })

export {
  getViewerState,
  getViewerStateForLocationSlug,
  getViewerStateForOrganizationSlug,
  getViewerStateForWorkspaceSlug,
}
