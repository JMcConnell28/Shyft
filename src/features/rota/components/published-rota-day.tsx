import type { WorkspaceDay } from "@/features/rota/types/workspace"
import type { PublishedRotaBoardIndex } from "@/features/rota/utils/published-rota-board"
import { Separator } from "@/components/ui/separator"
import { DayDateLabel } from "@/features/rota/components/day-date-label"
import { PublishedRotaShift } from "@/features/rota/components/published-rota-shift"

function PublishedRotaDay({
  day,
  boardIndex,
}: {
  day: WorkspaceDay
  boardIndex: PublishedRotaBoardIndex
}) {
  const shifts = boardIndex.shiftsByDayId[day.id] ?? []

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dfe5f0] bg-[#f8faff] ring-[#e7eaf2] md:rounded-lg">
      <div className="relative bg-card px-3 py-2.5">
        <DayDateLabel day={day} />
      </div>
      <Separator className="bg-[#edf0f6]" />
      <div className="no-scrollbar min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto overscroll-y-contain px-1 pt-2 pb-2 inset-shadow-sm/8">
        {shifts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#dfe5f0] bg-[#f7f8fb] px-3 py-3 text-center text-[11px] font-medium text-[#7a86a4]">
            No shifts yet for this day.
          </div>
        ) : (
          shifts.map((shift) => (
            <PublishedRotaShift
              key={shift.id}
              shift={shift}
              boardIndex={boardIndex}
            />
          ))
        )}
      </div>
    </div>
  )
}

export { PublishedRotaDay }
