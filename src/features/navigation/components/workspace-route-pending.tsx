import { useRouterState } from "@tanstack/react-router"
import { Skeleton } from "@/components/ui/skeleton"
import { getNavigationLabel } from "@/features/navigation/utils/navigation-timing"
import { RotaWorkspaceSkeleton } from "@/features/rota/components/rota-workspace-skeleton"

const loadingLabels = {
  dashboard: "Dashboard",
  rota: "Rotas",
  "rota-editor": "Rota editor",
  timesheets: "Timesheets",
  "time-clock": "Time tracking",
  settings: "Settings",
  other: "Page",
} as const

function WorkspaceRoutePending() {
  const section = useRouterState({
    select: (state) => getNavigationLabel(state.location.pathname),
  })
  if (section === "rota-editor") return <RotaWorkspaceSkeleton />
  const label = loadingLabels[section]
  return (
    <div
      role="status"
      aria-label={`Loading ${label}`}
      aria-busy="true"
      className="flex flex-1 flex-col gap-5 p-4 sm:p-6"
    >
      <span className="sr-only">Loading {label}…</span>
      <div aria-hidden="true" className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div
          className={
            section === "settings"
              ? "grid gap-5 md:grid-cols-[14rem_1fr]"
              : "space-y-3"
          }
        >
          {Array.from(
            { length: section === "settings" ? 2 : 4 },
            (_, index) => (
              <Skeleton
                key={index}
                className={
                  section === "settings"
                    ? "h-72 w-full rounded-xl"
                    : "h-20 w-full rounded-xl"
                }
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}

export { WorkspaceRoutePending }
