"use client"

import * as React from "react"

import type { WorkspaceBoardData } from "@/features/rota/types/workspace"
import RotaViewToolbar from "@/features/rota/components/rota-view-toolbar"
import { PublishedRotaDay } from "@/features/rota/components/published-rota-day"
import { buildPublishedRotaBoardIndex } from "@/features/rota/utils/published-rota-board"
import { useRotaZoneSelection } from "@/features/rota/hooks/use-rota-zone-selection"

function RotaViewWorkspace({ boardData }: { boardData: WorkspaceBoardData }) {
  const { selectedZoneId, setSelectedZoneId } = useRotaZoneSelection({
    rotaId: boardData.meta.rotaId,
    defaultZoneId: boardData.meta.settings.defaultZoneId,
    zones: boardData.zones,
  })
  const boardIndex = React.useMemo(
    () => buildPublishedRotaBoardIndex(boardData, selectedZoneId),
    [boardData, selectedZoneId]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2">
      <RotaViewToolbar
        boardData={boardData}
        selectedZoneId={selectedZoneId}
        onSelectZone={setSelectedZoneId}
      />
      <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="no-scrollbar grid h-full min-h-0 w-full touch-pan-x snap-x snap-mandatory auto-cols-[calc(50%_-_0.3125rem)] grid-flow-col gap-2.5 overflow-x-auto overscroll-x-contain scroll-smooth [-webkit-overflow-scrolling:touch] md:auto-cols-auto md:grid-flow-row md:grid-cols-7 md:gap-2 md:overflow-hidden">
            {boardData.days.map((day) => (
              <div
                key={day.id}
                className="h-full min-h-0 min-w-0 snap-start overflow-hidden"
              >
                <PublishedRotaDay day={day} boardIndex={boardIndex} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RotaViewWorkspace
