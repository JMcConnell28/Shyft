const INCLUDED_CORE_EMPLOYEES = 10

function calculateBillingSeatQuantities(activeEmployeeQuantity: number) {
  const normalizedActiveEmployeeQuantity = Math.max(
    Math.floor(activeEmployeeQuantity),
    0
  )

  return {
    activeEmployeeQuantity: normalizedActiveEmployeeQuantity,
    includedEmployeeQuantity: INCLUDED_CORE_EMPLOYEES,
    extraEmployeeQuantity: Math.max(
      normalizedActiveEmployeeQuantity - INCLUDED_CORE_EMPLOYEES,
      0
    ),
  }
}

export { INCLUDED_CORE_EMPLOYEES, calculateBillingSeatQuantities }
