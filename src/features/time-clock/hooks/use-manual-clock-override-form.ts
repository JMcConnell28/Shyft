import { useEffect, useState } from "react"
import type {
  ClockAction,
  ManagerClockEmployee,
} from "@/features/time-clock/types"
import { managerClockOverrideInputSchema } from "@/features/time-clock/schemas/time-clock-schemas"
import {
  getManualClockTime,
  toLocalClockInput,
} from "@/features/time-clock/utils/manual-clock-time"
import {
  getManagerClockEmployeeKey,
  getSuggestedManagerClockEmployeeKey,
} from "@/features/time-clock/utils/manager-clock-employees"

function useManualClockOverrideForm(input: {
  employees: Array<ManagerClockEmployee>
  initialAction: ClockAction
  initialEmployeeKey: string
  open: boolean
}) {
  const [action, setAction] = useState(input.initialAction)
  const [employeeKey, setEmployeeKey] = useState(input.initialEmployeeKey)
  const [reason, setReason] = useState("")
  const [time, setTime] = useState("")
  const suggested = getSuggestedManagerClockEmployeeKey(
    input.employees,
    input.initialAction
  )

  useEffect(() => {
    if (!input.open) return
    setAction(input.initialAction)
    setEmployeeKey(input.initialEmployeeKey || suggested)
    setReason("")
    setTime(toLocalClockInput())
  }, [input.initialAction, input.initialEmployeeKey, input.open, suggested])

  const employee =
    input.employees.find(
      (item) => getManagerClockEmployeeKey(item) === employeeKey
    ) ?? null
  let occurredAt: string | undefined
  let timeError: string | null = null
  try {
    if (time) {
      const selected = getManualClockTime(time)
      if (
        action === "clock_out" &&
        employee?.openEntry &&
        selected < new Date(employee.openEntry.clockedInAt)
      ) {
        throw new Error("Clock-out must be at or after the clock-in time.")
      }
      occurredAt = selected.toISOString()
    }
  } catch (error) {
    timeError = error instanceof Error ? error.message : "Choose a valid time."
  }

  return {
    action,
    employee,
    employeeKey,
    reason,
    time,
    timeError,
    occurredAt,
    isValid:
      employee !== null &&
      occurredAt !== undefined &&
      managerClockOverrideInputSchema.shape.reason.safeParse(reason).success,
    setAction: (value: ClockAction) => {
      setAction(value)
      setEmployeeKey(
        getSuggestedManagerClockEmployeeKey(input.employees, value)
      )
    },
    setEmployeeKey,
    setReason,
    setTime,
  }
}

export { useManualClockOverrideForm }
