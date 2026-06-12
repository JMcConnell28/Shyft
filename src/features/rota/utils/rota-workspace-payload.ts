import type { WorkspaceAssignment, WorkspaceBoardMeta, WorkspaceShift } from "@/features/rota/types/workspace"

function buildSaveRotaWorkspacePayload(input: {
  assignmentsById: Record<string, WorkspaceAssignment>
  meta: WorkspaceBoardMeta
  shiftsById: Record<string, WorkspaceShift>
}) {
  return {
    rotaId: input.meta.rotaId,
    shifts: Object.values(input.shiftsById),
    assignments: Object.values(input.assignmentsById),
  }
}

export { buildSaveRotaWorkspacePayload }
