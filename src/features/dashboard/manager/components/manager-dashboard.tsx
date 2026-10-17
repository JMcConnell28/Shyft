import { useDashboardData } from "../hooks/use-dashboard-data"
import { useDashboardActions } from "../hooks/use-dashboard-actions"
import { useTeamFilters } from "../hooks/use-team-filters"
import { ManagerDashboardHeader } from "./dashboard-header"
import { ManagerDashboardSummary } from "./dashboard-summary"
import { ManagerTeamSection } from "./team-section"
import { ManagerAttentionSection } from "./attention-section"
import { ManagerComingUp } from "./coming-up"
import { ManagerDashboardDialogs } from "./dashboard-dialogs"
import {
  ManagerDashboardError,
  ManagerDashboardLoading,
} from "./dashboard-state"
import type { ManagerDayData } from "../types"
import { getDateKeyInTimeZone } from "@/lib/time-zone"

function ManagerDashboard({
  organizationId,
  userId,
  workspaceSlug,
  search,
  onSearch,
}: {
  organizationId: string
  userId: string
  workspaceSlug: string
  search: { location?: string; date?: string }
  onSearch: (value: { location?: string; date?: string }) => void
}) {
  const { access, location, day, attention, setAttentionPage } =
    useDashboardData(organizationId, userId, search)
  const filters = useTeamFilters(
    day.data?.team ?? [],
    `${location?.id}:${search.date ?? "today"}`
  )
  const actions = useDashboardActions(organizationId, userId)
  const scrollTo = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  const selectTeam = (status: "all" | "scheduled" | "working") => {
    filters.reset()
    filters.setStatus(status)
    scrollTo("dashboard-team")
  }

  if (access.isPending) return <ManagerDashboardLoading />
  if (access.isError)
    return <ManagerDashboardError onRetry={() => void access.refetch()} />
  if (!location)
    return (
      <div className="p-6 text-sm text-[#7481a0]">
        {search.location
          ? "This location is not available in your current workspace. Choose a permitted location from the dashboard."
          : "No locations are available to manage yet."}
        {search.location ? (
          <button
            className="ml-2 font-semibold text-blue-600"
            onClick={() => onSearch({ date: search.date })}
          >
            Show permitted locations
          </button>
        ) : null}
      </div>
    )

  const today = getDateKeyInTimeZone(new Date(), location.timeZone)
  const placeholder: ManagerDayData = {
    location,
    today,
    date: search.date ?? today,
    isToday: !search.date || search.date === today,
    updatedAt: new Date().toISOString(),
    team: [],
    clockEmployees: [],
    planning: [],
  }
  const data = day.data ?? placeholder
  return (
    <main className="flex flex-1 flex-col bg-[#f6f8fc] p-4 text-[#10204b] sm:p-6 lg:p-7">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-4">
        <ManagerDashboardHeader
          access={access.data}
          data={data}
          locationId={location.id}
          workspaceSlug={workspaceSlug}
          refreshing={day.isFetching || attention.isFetching}
          staffingStatus={day.status}
          onLocation={(id) => {
            filters.reset()
            onSearch({ location: id, date: search.date })
          }}
          onDate={(date) => {
            filters.reset()
            onSearch({ location: location.id, date })
          }}
          onRefresh={() => {
            void access.refetch()
            void day.refetch()
            void attention.refetch()
          }}
        />
        {day.data ? (
          <ManagerDashboardSummary
            data={day.data}
            attentionTotal={attention.data?.total}
            onScheduled={() => selectTeam("scheduled")}
            onWorking={() => selectTeam("working")}
            onAll={() => selectTeam("all")}
            onAttention={() => scrollTo("dashboard-attention")}
          />
        ) : null}
        {day.isError ? (
          <ManagerDashboardError
            message={
              day.data
                ? "Could not refresh staffing. The last recorded data is shown below."
                : undefined
            }
            onRetry={() => void day.refetch()}
          />
        ) : null}
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-4">
            {day.isPending ? (
              <ManagerDashboardLoading />
            ) : day.data ? (
              <>
                <ManagerTeamSection
                  data={day.data}
                  filters={filters}
                  workspaceSlug={workspaceSlug}
                  canManageRota={access.data.capabilities.canManageRota}
                  onClock={(row, action) =>
                    actions.openClock(row, action, day.data)
                  }
                  onReview={(row) => actions.reviewTeam(row, day.data)}
                />
                <ManagerComingUp
                  data={day.data}
                  access={access.data}
                  workspaceSlug={workspaceSlug}
                />
              </>
            ) : null}
          </div>
          <ManagerAttentionSection
            data={attention.data}
            error={attention.isError}
            pending={attention.isFetching}
            workspaceSlug={workspaceSlug}
            onPage={setAttentionPage}
            onReview={(item) =>
              actions.setRequest({
                kind: item.kind === "arrival" ? "arrival" : "review",
                item,
              })
            }
            onRetry={() => void attention.refetch()}
          />
        </div>
      </div>
      <ManagerDashboardDialogs
        actions={actions}
        access={access.data}
        organizationId={organizationId}
        workspaceSlug={workspaceSlug}
      />
    </main>
  )
}
export { ManagerDashboard }
