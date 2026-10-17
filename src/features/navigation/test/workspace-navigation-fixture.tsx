import * as React from "react"
import {
  Outlet,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useBlocker,
  useRouterState,
} from "@tanstack/react-router"
import { WorkspaceRoutePending } from "@/features/navigation/components/workspace-route-pending"
import { WorkspaceRouteError } from "@/features/navigation/components/workspace-route-error"
import { useRenderedPathname } from "@/features/navigation/hooks/use-rendered-pathname"

function deferred() {
  let resolve: () => void = () => undefined
  const promise = new Promise<void>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

function setup(
  loader: () => Promise<void>,
  blocked = false,
  beforeLoad?: () => Promise<void> | undefined
) {
  let mounts = 0
  function Shell() {
    React.useEffect(() => {
      mounts++
    }, [])
    const rendered = useRenderedPathname()
    const requested = useRouterState({
      select: (state) => state.location.pathname,
    })
    return (
      <>
        <aside data-testid="selection">{requested}</aside>
        <header data-testid="breadcrumb">{rendered}</header>
        <Outlet />
      </>
    )
  }
  function Editor() {
    useBlocker({ shouldBlockFn: () => blocked })
    return <button>Save current rota</button>
  }
  const root = createRootRoute({ component: Shell, beforeLoad })
  const editor = createRoute({
    getParentRoute: () => root,
    path: "/app/team/rota",
    component: Editor,
  })
  const destination = createRoute({
    getParentRoute: () => root,
    path: "/app/team/timesheets",
    loader,
    component: () => <h1>Team timesheets</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([editor, destination]),
    history: createMemoryHistory({ initialEntries: ["/app/team/rota"] }),
    defaultPendingMs: 150,
    defaultPendingMinMs: 0,
    defaultPendingComponent: WorkspaceRoutePending,
    defaultErrorComponent: WorkspaceRouteError,
  })
  return { router, mountCount: () => mounts }
}

export { deferred, setup }
