import { Link } from "@tanstack/react-router"
import { format, parseISO } from "date-fns"
import { ChevronRightIcon } from "lucide-react"
import { dashboardCompactButtonClass } from "../constants"
import type { ManagerDashboardAccess, ManagerDayData } from "../types"
import { Button } from "@/components/ui/button"
import { NewRotaDialog } from "@/features/rota/components/new-rota-dialog"
import { parseRotaListSearch } from "@/features/rota/schemas/rota-schemas"
import {
  DashboardPanel,
  DashboardPanelContent,
  DashboardPanelHeader,
} from "@/features/dashboard/components/dashboard-layout"

function ManagerComingUp({
  data,
  access,
  workspaceSlug,
}: {
  data: ManagerDayData
  access: ManagerDashboardAccess
  workspaceSlug: string
}) {
  const canCreate = access.capabilities.canCreateRota && data.location.canWrite
  const canEdit = access.capabilities.canUpdateRota && data.location.canWrite
  const locations = access.locations
    .filter((item) => item.canWrite)
    .map((item) => ({ ...item, hasUnreadPublished: false }))
  const selectedLocation =
    locations.find((item) => item.id === data.location.id) ?? null
  return (
    <DashboardPanel
      variant="framed"
      className="xl:col-start-2 xl:row-start-2"
      aria-labelledby="coming-up-heading"
    >
      <DashboardPanelHeader
        headingId="coming-up-heading"
        title="Upcoming rotas"
        action={
          <Link
            to="/app/$workspaceSlug/rota"
            params={{ workspaceSlug }}
            search={parseRotaListSearch({ location: data.location.slug })}
            className="inline-flex min-h-11 items-center gap-1 rounded-lg text-xs font-medium text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:min-h-7"
          >
            View all <ChevronRightIcon className="size-4" />
          </Link>
        }
      />
      <DashboardPanelContent>
        {data.planning.some((week) => week.rotaId) ? (
          <div className="divide-y divide-border/60">
            {data.planning.map((week, index) => (
              <div
                key={week.weekStart}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {index === 0 ? "This week" : "Next week"}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {format(parseISO(week.weekStart), "d MMM")}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {week.status === "not_started"
                      ? "Not started"
                      : week.status === "draft"
                        ? "Draft"
                        : week.hasChanges
                          ? "Published · unpublished changes"
                          : "Published"}
                    {week.unfilled > 0 ? ` · ${week.unfilled} unfilled` : ""}
                  </p>
                </div>
                {week.rotaId ? (
                  <Button
                    nativeButton={false}
                    variant="outline"
                    className={dashboardCompactButtonClass}
                    render={
                      <Link
                        to={
                          canEdit || week.status === "draft"
                            ? "/app/$workspaceSlug/rota/$locationSlug/$rotaId"
                            : "/app/$workspaceSlug/rota/$locationSlug/$rotaId/view"
                        }
                        params={{
                          workspaceSlug,
                          locationSlug: data.location.slug,
                          rotaId: week.rotaId,
                        }}
                      />
                    }
                  >
                    {canEdit && (week.status === "draft" || week.hasChanges)
                      ? "Continue editing"
                      : "Open rota"}
                  </Button>
                ) : canCreate ? (
                  <NewRotaDialog
                    key={`${data.location.id}:${week.weekStart}`}
                    locations={locations}
                    selectedLocation={selectedLocation}
                    initialWeekStart={week.weekStart}
                    triggerLabel="Create rota"
                    triggerClassName={`${dashboardCompactButtonClass} border border-input bg-card text-foreground hover:bg-muted hover:text-foreground`}
                  />
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="p-4 text-sm text-muted-foreground">
            No upcoming rotas.
          </p>
        )}
      </DashboardPanelContent>
    </DashboardPanel>
  )
}
export { ManagerComingUp }
