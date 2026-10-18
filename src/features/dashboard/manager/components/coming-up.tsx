import { Link } from "@tanstack/react-router"
import { format, parseISO } from "date-fns"
import type { ManagerDashboardAccess, ManagerDayData } from "../types"
import { Button } from "@/components/ui/button"
import { NewRotaDialog } from "@/features/rota/components/new-rota-dialog"

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
    <section
      className="rounded-xl border border-[#e0e6f1] bg-white"
      aria-labelledby="coming-up-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edf0f6] p-4">
        <h2 id="coming-up-heading" className="text-sm font-bold">
          Coming up
        </h2>
      </div>
      <div className="divide-y divide-[#edf0f6] sm:grid sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {data.planning.map((week, index) => (
          <div
            key={week.weekStart}
            className="flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <div>
              <p className="text-xs font-bold">
                {index === 0 ? "This week" : "Next week"}{" "}
                <span className="font-medium text-[#7481a0]">
                  · {format(parseISO(week.weekStart), "d MMM")}
                </span>
              </p>
              <p className="mt-1 text-[11px] text-[#7481a0]">
                {week.status === "not_started"
                  ? "Not started"
                  : week.status === "draft"
                    ? "Draft"
                    : week.hasChanges
                      ? "Published · unpublished changes"
                      : "Published"}
                {week.rotaId ? ` · ${week.unfilled} unfilled shifts` : ""}
              </p>
            </div>
            {week.rotaId ? (
              <Button
                nativeButton={false}
                variant="outline"
                className="h-9 rounded-lg"
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
                triggerClassName="h-9 rounded-lg border border-[#dfe4ef] bg-white text-[#236cff] hover:bg-blue-50"
              />
            ) : null}
          </div>
        ))}
      </div>
      {data.location.attendanceEnabled ? (
        <div className="border-t border-[#edf0f6] px-4 py-3">
          <Link
            to="/app/$workspaceSlug/timesheets"
            params={{ workspaceSlug }}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Review timesheets →
          </Link>
        </div>
      ) : null}
    </section>
  )
}
export { ManagerComingUp }
