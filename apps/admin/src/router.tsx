import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { getSecuritySsrOptions } from "@rocketrota/shared/security"

import { routeTree } from "./routeTree.gen"

function getRouter() {
  return createTanStackRouter({
    defaultPreload: "intent",
    routeTree,
    ssr: getSecuritySsrOptions(),
    scrollRestoration: true,
  })
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}

export { getRouter }
