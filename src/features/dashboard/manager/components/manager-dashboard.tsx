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
import { useContentReadyTiming } from "@/features/navigation/hooks/use-content-ready-timing"
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout"
import { Button } from "@/components/ui/button"

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
  useContentReadyTiming(Boolean(day.data))
  const filters = useTeamFilters(
    day.data?.team ?? [],
    `${location?.id}:${search.date ?? "today"}`
  )
  const actions = useDashboardActions(organizationId, userId)
  const scrollTo = (id: string) => {
    const section = document.getElementById(id)
    if (!section) return
    section.focus({ preventScroll: true })
    section.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    })
  }
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
          <Button
            variant="outline"
            className="ml-2"
            onClick={() => onSearch({ date: search.date })}
          >
            Show permitted locations
          </Button>
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
    <DashboardLayout className="max-w-[1440px] gap-4 sm:gap-6 sm:pt-6">
      <ManagerDashboardHeader
        access={access.data}
        data={data}
        locationId={location.id}
        workspaceSlug={workspaceSlug}
        onLocation={(id) => {
          filters.reset()
          onSearch({ location: id, date: search.date })
        }}
        onDate={(date) => {
          filters.reset()
          onSearch({ location: location.id, date })
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
      <div className="grid items-start gap-4 sm:gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] xl:grid-rows-[auto_1fr]">
        <div className="min-w-0 xl:col-start-1 xl:row-span-2 xl:row-start-1">
          {day.isPending ? (
            <ManagerDashboardLoading />
          ) : day.data ? (
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
        {day.data ? (
          <ManagerComingUp
            data={day.data}
            access={access.data}
            workspaceSlug={workspaceSlug}
          />
        ) : null}
      </div>
      <ManagerDashboardDialogs
        actions={actions}
        access={access.data}
        organizationId={organizationId}
        workspaceSlug={workspaceSlug}
      />
    </DashboardLayout>
  )
}
export { ManagerDashboard }
