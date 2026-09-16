import type {
  ClockAction,
  ManagerClockEmployee,
} from "@/features/time-clock/types"

function getManagerClockEmployeeKey(employee: ManagerClockEmployee) {
  return `${employee.locationId}:${employee.id}`
}

function getSuggestedManagerClockEmployeeKey(
  employees: Array<ManagerClockEmployee>,
  action: ClockAction
) {
  const employee = employees.find((item) =>
    action === "clock_in" ? !item.openEntry : Boolean(item.openEntry)
  )

  return employee ? getManagerClockEmployeeKey(employee) : ""
}

export {
  getManagerClockEmployeeKey,
  getSuggestedManagerClockEmployeeKey,
}
