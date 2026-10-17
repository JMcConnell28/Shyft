import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"

import { routeTree } from "./routeTree.gen"
import { createQueryClient } from "@/lib/query-client"
import { installNavigationTiming } from "@/features/navigation/utils/navigation-timing"
import { installQueryTiming } from "@/features/navigation/utils/query-timing"
import { WorkspaceRoutePending } from "@/features/navigation/components/workspace-route-pending"
import { WorkspaceRouteError } from "@/features/navigation/components/workspace-route-error"

export function getRouter() {
  const queryClient = createQueryClient()
  installQueryTiming(queryClient)
  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },

    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 30_000,
    defaultStaleTime: 30_000,
    defaultViewTransition: true,
    defaultPendingMs: 150,
    defaultPendingMinMs: 0,
    defaultPendingComponent: WorkspaceRoutePending,
    defaultErrorComponent: WorkspaceRouteError,
  })

  setupRouterSsrQueryIntegration({ queryClient, router })
  installNavigationTiming(router)

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
