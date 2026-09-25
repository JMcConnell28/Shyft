import { redirect } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"

import type {
  NavigationSession,
  WorkspaceViewer,
} from "@/features/navigation/types"
import type { ViewerState } from "@/features/onboarding/types"
import { navigationQueryKeys } from "@/features/navigation/query-keys"
import {
  navigationSessionQueryOptions,
  workspaceViewerQueryOptions,
} from "@/features/navigation/query-options"
import { activateOrganization } from "@/features/onboarding/server/organization-actions"
import { getViewerState } from "@/features/onboarding/server/viewer"

type NavigationContext = {
  queryClient: QueryClient
  navigationSession: NavigationSession
}

async function loadNavigationSession(
  queryClient: QueryClient,
  href: string
): Promise<NavigationSession> {
  const cachedSession = queryClient.getQueryData(
    navigationSessionQueryOptions().queryKey
  )
  if (cachedSession && cachedSession.expiresAt <= Date.now()) {
    queryClient.removeQueries({ queryKey: navigationQueryKeys.all })
  }

  const session = await queryClient.fetchQuery(navigationSessionQueryOptions())
  if (!session || session.expiresAt <= Date.now()) {
    queryClient.removeQueries({ queryKey: navigationQueryKeys.all })
    throw redirect({ to: "/login", search: { redirect: href } })
  }

  if (
    cachedSession &&
    (cachedSession.sessionId !== session.sessionId ||
      cachedSession.user.id !== session.user.id)
  ) {
    queryClient.removeQueries({ queryKey: navigationQueryKeys.viewers })
  }
  return session
}

async function loadDefaultViewer({
  queryClient,
  navigationSession,
}: NavigationContext): Promise<ViewerState> {
  // Setup/return routes need fresh onboarding state after each completed step.
  const viewer = await getViewerState()
  if (!viewer || viewer.user.id !== navigationSession.user.id) {
    queryClient.removeQueries({ queryKey: navigationQueryKeys.all })
    throw redirect({ to: "/login", search: { redirect: "/dashboard" } })
  }
  updateActiveOrganization(
    queryClient,
    navigationSession,
    viewer.activeOrganizationId
  )
  return viewer
}

async function loadWorkspaceViewer(
  { queryClient, navigationSession }: NavigationContext,
  workspaceSlug: string,
  options: { preload: boolean; href: string }
): Promise<WorkspaceViewer> {
  const queryOptions = workspaceViewerQueryOptions({
    workspaceSlug,
    sessionId: navigationSession.sessionId,
    userId: navigationSession.user.id,
  })
  const viewer = await queryClient.fetchQuery(queryOptions)

  if (!viewer?.activeWorkspace) {
    queryClient.removeQueries({ queryKey: queryOptions.queryKey, exact: true })
    await queryClient.invalidateQueries({
      queryKey: navigationQueryKeys.session,
      refetchType: "none",
    })
    throw redirect({ to: "/dashboard" })
  }

  const organizationId = viewer.activeWorkspace.organizationId
  if (organizationId !== navigationSession.activeOrganizationId) {
    // Preloads may warm the read-only viewer, but must not switch the session
    // or start page loaders that require a different active organization.
    // reloadDocument makes Router stop this speculative load instead of
    // recursively preloading the redirect target. Actual navigation activates
    // the organization below and proceeds through the client router.
    if (options.preload) {
      throw redirect({ href: options.href, reloadDocument: true })
    }
    await activateOrganization({ data: { organizationId } })
    updateActiveOrganization(queryClient, navigationSession, organizationId)
  }

  return { ...viewer, user: navigationSession.user }
}

function updateActiveOrganization(
  queryClient: QueryClient,
  session: NavigationSession,
  activeOrganizationId: string | null
): void {
  queryClient.setQueryData(
    navigationQueryKeys.session,
    {
      ...session,
      activeOrganizationId,
    },
    {
      updatedAt: queryClient.getQueryState(navigationQueryKeys.session)
        ?.dataUpdatedAt,
    }
  )
}

export { loadDefaultViewer, loadNavigationSession, loadWorkspaceViewer }
