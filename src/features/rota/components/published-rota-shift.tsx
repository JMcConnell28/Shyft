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
  const timeLines = getShiftDisplayLines(shift)
  const zoneLabel =
    boardIndex.zoneNamesById[shift.zoneId] ?? shift.zoneName ?? "Shift"
  const assignments = boardIndex.assignmentsByShiftId[shift.id] ?? []

  return (
    <div className="space-y-1">
      <div className="space-y-0.5">
        <div className="flex h-7 w-full items-center justify-between rounded-sm border border-[#edf0f6] bg-card p-2 shadow-xs">
          <div className="flex h-full w-full items-center justify-between">
            <div className="min-w-0 text-[10px] font-extrabold tracking-[-0.015em] text-[#11245a]">
              {timeLines.map((line) => (
                <p key={line} className="truncate">
                  {line}
                </p>
              ))}
            </div>
            <p className="mt-0.5 text-[10px] font-bold text-[#61709a]">
              {zoneLabel}
            </p>
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
