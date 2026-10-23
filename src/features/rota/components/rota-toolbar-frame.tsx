import { useRotaWorkspace } from "./rota-workspace-provider"
import { RotaVersionLabel } from "./rota-version-label"
import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"

function ToolBarFrame({
  actions,
  tools,
}: {
  actions: ReactNode
  tools: ReactNode
}) {
  const { days, hasUnsavedChanges, isDemo, meta, selectedLocation } =
    useRotaWorkspace()
  const weekRangeLabel = getWeekRangeLabel(days)
  const status = meta.status

  return (
    <div className="flex w-full shrink-0 flex-col gap-2 md:h-10 md:flex-row md:items-center md:gap-3 md:px-2">
      <div className="w-full shrink-0 md:w-64">
        <div className="flex w-full min-w-0 flex-col justify-center rounded-xl bg-white px-3 py-2 shadow-[0_6px_18px_rgba(30,50,96,0.05)] ring-1 ring-[#e7eaf2] sm:bg-transparent md:shadow-none md:ring-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-extrabold tracking-[-0.025em] text-[#11245a] md:font-semibold md:tracking-normal md:text-foreground">
              {selectedLocation.name}
            </span>
            <Badge
              variant="outline"
              className={getStatusBadgeClassName(status)}
            >
              <span
                aria-hidden="true"
                className={getStatusDotClassName(status)}
              />
              {getStatusLabel(status)}
            </Badge>
          </div>
          <span className="mt-0.5 text-xs font-semibold text-[#61709a] md:mt-0 md:font-normal md:text-muted-foreground">
            {weekRangeLabel}
          </span>
          {!isDemo ? (
            <RotaVersionLabel
              meta={meta}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-2 overflow-hidden">
        <div className="no-scrollbar flex min-w-0 items-center gap-1.5 overflow-x-auto p-px">
          {tools}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
      </div>
    </div>
  )
}

function getWeekRangeLabel(days: ReturnType<typeof useRotaWorkspace>["days"]) {
  const firstDay = days[0]
  const lastDay = days[days.length - 1]

  if (firstDay.monthLabel === lastDay.monthLabel) {
    return `${firstDay.dayNumber} - ${lastDay.dayNumber} ${lastDay.monthLabel}`
  }

  return `${firstDay.dayNumber} ${firstDay.monthLabel} - ${lastDay.dayNumber} ${lastDay.monthLabel}`
}

function getStatusBadgeClassName(status: "draft" | "published") {
  return status === "published"
    ? "gap-1.5 rounded-full border-emerald-200/80 bg-emerald-50/80 px-2.5 text-[10px] font-semibold tracking-[0.08em] text-emerald-700 uppercase shadow-sm shadow-emerald-100/60"
    : "gap-1.5 rounded-full border-amber-200/80 bg-amber-50/90 px-2.5 text-[10px] font-semibold tracking-[0.08em] text-amber-700 uppercase shadow-sm shadow-amber-100/70"
}

function getStatusDotClassName(status: "draft" | "published") {
  return status === "published"
    ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
    : "h-1.5 w-1.5 rounded-full bg-amber-500"
}

function getStatusLabel(status: "draft" | "published") {
  return status === "published" ? "Published" : "Draft"
}

export { ToolBarFrame }
