"use client"

import RotaViewToolbar from "@/features/rota/components/rota-view-toolbar"
import { RotaWorkspaceProvider } from "@/features/rota/components/rota-workspace-provider"
import WeekContainer from "@/features/rota/components/week-container"
import type { WorkspaceBoardData } from "@/features/rota/types/workspace"

function RotaViewWorkspace({ boardData }: { boardData: WorkspaceBoardData }) {
  return (
    <RotaWorkspaceProvider boardData={boardData}>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2">
        <RotaViewToolbar />
        <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
          <WeekContainer readOnly mobileDayColumns={2} />
        </div>
      </div>
    </RotaWorkspaceProvider>
  )
}

export default RotaViewWorkspace
