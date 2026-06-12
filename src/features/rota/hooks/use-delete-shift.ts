"use client"

import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { showSuccessToast } from "@/lib/toast"

function useDeleteShift() {
  const { deleteShift } = useRotaWorkspace()

  async function removeShift(shiftId: string) {
    const result = await deleteShift(shiftId)

    if (result.status !== "success") {
      return result
    }

    showSuccessToast(
      result.removedAssignmentCount > 0
        ? `Shift deleted and ${result.removedAssignmentCount} team member${result.removedAssignmentCount === 1 ? "" : "s"} removed.`
        : "Shift deleted.",
    )

    return result
  }

  return {
    removeShift,
  }
}

export { useDeleteShift }
