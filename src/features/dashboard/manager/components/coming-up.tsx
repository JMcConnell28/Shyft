import { Link } from "@tanstack/react-router"
import { format, parseISO } from "date-fns"
import { ChevronRightIcon } from "lucide-react"
import type { ManagerDashboardAccess, ManagerDayData } from "../types"
import { Button } from "@/components/ui/button"
import { NewRotaDialog } from "@/features/rota/components/new-rota-dialog"
import { parseRotaListSearch } from "@/features/rota/schemas/rota-schemas"
import {
  DashboardPanel,
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
      className="xl:col-start-2 xl:row-start-2"
      aria-labelledby="coming-up-heading"
    >
      <DashboardPanelHeader
        headingId="coming-up-heading"
        title="Coming up"
        description="Rota planning for this location."
        action={
          <Link
            to="/app/$workspaceSlug/rota"
            params={{ workspaceSlug }}
            search={parseRotaListSearch({ location: data.location.slug })}
            className="inline-flex min-h-11 items-center gap-1 text-xs font-medium text-primary hover:underline md:min-h-8 dark:text-sky-300"
          >
            View all <ChevronRightIcon className="size-4" />
          </Link>
        }
      />
      {data.planning.some((week) => week.rotaId) ? (
        <div className="divide-y divide-border border-t">
          {data.planning.map((week, index) => (
            <div
              key={week.weekStart}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5"
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
                  className="h-11 rounded-lg text-sm sm:h-10 md:h-8 md:text-xs"
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
                  triggerClassName="h-11 rounded-lg border border-input bg-card text-sm text-primary shadow-none hover:bg-muted hover:text-primary sm:h-10 md:h-8 md:text-xs dark:text-sky-300 dark:hover:text-sky-300"
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="border-t px-4 py-3 text-sm text-muted-foreground">
          No upcoming rotas.
        </p>
      )}
    </DashboardPanel>
  )
}
export { ManagerComingUp }
