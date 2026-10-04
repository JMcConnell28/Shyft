const INCLUDED_CORE_EMPLOYEES = 10

type BillingSeatQuantities = {
  usedEmployeeQuantity: number
  includedEmployeeQuantity: number
  extraEmployeeQuantity: number
}

function calculateBillingSeatQuantities(
  usedEmployeeQuantity: number
): BillingSeatQuantities {
  const normalizedUsedEmployeeQuantity = Math.max(
    Math.floor(usedEmployeeQuantity),
    0
  )

  return {
    usedEmployeeQuantity: normalizedUsedEmployeeQuantity,
    includedEmployeeQuantity: INCLUDED_CORE_EMPLOYEES,
    extraEmployeeQuantity: Math.max(
      normalizedUsedEmployeeQuantity - INCLUDED_CORE_EMPLOYEES,
      0
    ),
  }
}

function calculateTimeAttendanceOverageQuantity(employeeCount: number): number {
  return Math.max(Math.floor(employeeCount) - INCLUDED_CORE_EMPLOYEES, 0)
}

export {
  INCLUDED_CORE_EMPLOYEES,
  calculateBillingSeatQuantities,
  calculateTimeAttendanceOverageQuantity,
}
export type { BillingSeatQuantities }
