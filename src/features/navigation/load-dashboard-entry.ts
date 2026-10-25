import { redirect } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"

import type { NavigationSession } from "@/features/navigation/types"
import { navigationQueryKeys } from "@/features/navigation/query-keys"
import { getDashboardEntry } from "@/features/navigation/server-fns"
import { getOrganizationDashboardPath } from "@/lib/organization-paths"

async function loadDashboardEntry({
  queryClient,
  navigationSession,
}: {
  queryClient: QueryClient
  navigationSession: NavigationSession
}): Promise<never> {
  const entry = await getDashboardEntry()
  if (
    !entry ||
    entry.userId !== navigationSession.user.id ||
    entry.sessionId !== navigationSession.sessionId ||
    navigationSession.expiresAt <= Date.now()
  ) {
    queryClient.removeQueries({ queryKey: navigationQueryKeys.all })
    throw redirect({ to: "/login", search: { redirect: "/dashboard" } })
  }

  queryClient.setQueryData(
    navigationQueryKeys.session,
    { ...navigationSession, activeOrganizationId: entry.activeOrganizationId },
    {
      updatedAt: queryClient.getQueryState(navigationQueryKeys.session)
        ?.dataUpdatedAt,
    }
  )
  const destination = entry.destination
  if (destination.kind === "join-status") {
    throw redirect({
      to: "/join-status/$requestId",
      params: { requestId: destination.requestId },
    })
  }
  if (destination.kind === "onboarding") {
    throw redirect({ to: destination.path })
  }

  throw redirect({
    href: getOrganizationDashboardPath(destination.workspaceSlug),
  })
}

export { loadDashboardEntry }
