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
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dfe5f0] bg-[#f8faff] ring-[#e7eaf2] md:rounded-lg">
      <DayDate
        day={day}
        openShiftCount={dayInsight.openShiftCount}
        showOpenShiftCount={!readOnly}
      />
      <Separator className="bg-[#edf0f6]" />
      <div className="no-scrollbar min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto overscroll-contain px-1 pt-2 pb-2 inset-shadow-sm/8">
        {shiftIds.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#dfe5f0] bg-[#f7f8fb] px-3 py-3 text-center text-[11px] font-medium text-[#7a86a4]">
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
