import * as React from "react"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { buildShiftAssignmentOptions } from "@/features/rota/utils/shift-assignment-options"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useShiftAssignment(shiftId: string) {
  const {
    allEmployeeGroups,
    employeesById,
    assignmentsById,
    days,
    selectedLocation,
    shiftsById,
    meta,
    assignEmployeeToShift,
  } = useRotaWorkspace()
  const [isAssigning, setIsAssigning] = React.useState(false)
  const assignmentInProgress = React.useRef(false)
  const options = React.useMemo(
    () =>
      buildShiftAssignmentOptions({
        assignmentsById,
        days,
        location: selectedLocation,
        shiftId,
        shiftsById,
        employees: Object.values(employeesById),
        employeeGroups: allEmployeeGroups,
      }),
    [
      assignmentsById,
      days,
      selectedLocation,
      shiftId,
      shiftsById,
      employeesById,
      allEmployeeGroups,
    ]
  )

  async function assignEmployee(employeeId: string): Promise<boolean> {
    const option = options.find((entry) => entry.employee.id === employeeId)
    if (
      !meta.canEdit ||
      !option ||
      option.disabledReason ||
      assignmentInProgress.current
    )
      return false

    assignmentInProgress.current = true
    setIsAssigning(true)
    try {
      const result = await assignEmployeeToShift(employeeId, shiftId)
      if (result.status === "overlap") {
        showErrorToast(
          new Error(`${result.employeeName} has an overlapping shift.`)
        )
        return false
      }
      if (result.status !== "success") return false

      showSuccessToast(`${option.employee.name} assigned to shift.`)
      return true
    } catch (error) {
      showErrorToast(error, {
        fallbackMessage: "Unable to assign this employee.",
      })
      return false
    } finally {
      assignmentInProgress.current = false
      setIsAssigning(false)
    }
  }

  return { options, isAssigning, canAssign: meta.canEdit, assignEmployee }
}

export { useShiftAssignment }
