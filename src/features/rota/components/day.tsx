import DayDate from "./day-date"
import Shift from "./shift"
import { Separator } from "@/components/ui/separator"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"

function Day({ dayId }: { dayId: string }) {
  return <DayContent dayId={dayId} />
}

function DayContent({
  dayId,
  readOnly = false,
}: {
  dayId: string
  readOnly?: boolean
}) {
  const { dayInsightsById, days, shiftIdsByDayId } = useRotaWorkspace()
  const day = days.find((entry) => entry.id === dayId)
  const shiftIds = shiftIdsByDayId[dayId] ?? []
  const dayInsight = dayInsightsById[dayId] ?? {
    openShiftCount: 0,
  }

  if (!day) {
    return null
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-sm bg-neutral-100 shadow-inner shadow-neutral-200 outline">
      <DayDate
        day={day}
        openShiftCount={dayInsight.openShiftCount}
        showOpenShiftCount={!readOnly}
      />
      <Separator className="mb-1" />
      <div className="no-scrollbar min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-1.5 pb-1.5">
        {shiftIds.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/70 bg-background/70 px-2 py-3 text-center text-[11px] text-muted-foreground">
            No shifts yet for this day.
          </div>
        ) : (
          shiftIds.map((shiftId) => (
            <Shift key={shiftId} shiftId={shiftId} readOnly={readOnly} />
          ))
        )}
      </div>
    </div>
  )
}

export { DayContent }
export default Day
