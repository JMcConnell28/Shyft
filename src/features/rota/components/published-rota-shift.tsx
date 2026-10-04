import type { PublishedRotaBoardIndex } from "@/features/rota/utils/published-rota-board"
import type { WorkspaceShift } from "@/features/rota/types/workspace"
import AssignedEmployeeName from "@/features/rota/components/assigned-employee-name"
import { getShiftDisplayLines } from "@/features/rota/utils/workspace-shifts"

function PublishedRotaShift({
  shift,
  boardIndex,
}: {
  shift: WorkspaceShift
  boardIndex: PublishedRotaBoardIndex
}) {
  const timeLines = getShiftDisplayLines(shift, boardIndex.timeFormat)
  const assignments = boardIndex.assignmentsByShiftId[shift.id] ?? []

  return (
    <div className="space-y-1">
      <div className="space-y-0.5">
        <div className="flex min-h-7 w-full items-center rounded-sm border border-[#edf0f6] bg-card px-2 py-1 shadow-xs">
          <div className="min-w-0 text-[10px] font-extrabold tracking-[-0.015em] text-[#11245a]">
            {timeLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center">
          {assignments.length === 0 ? (
            <p className="text-[10px] font-medium text-[#7a86a4]">
              No one assigned yet
            </p>
          ) : (
            assignments.map((assignment) => {
              const employee = boardIndex.employeesById[assignment.employeeId]
              return employee ? (
                <AssignedEmployeeName key={assignment.id} employee={employee} />
              ) : null
            })
          )}
        </div>
      </div>
    </div>
  )
}

export { PublishedRotaShift }
