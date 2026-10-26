import type { CompanyEmployeePayrollUpdate } from "@/features/company/types"

function normalizePayrollUpdates(
  updates: Array<CompanyEmployeePayrollUpdate>
): Array<CompanyEmployeePayrollUpdate> {
  const employeeIds = new Set<string>()
  const payrollIds = new Set<string>()

  return updates.map((update) => {
    if (employeeIds.has(update.employeeId)) {
      throw new Error("Each employee can only appear once in an import.")
    }
    employeeIds.add(update.employeeId)
    const payrollId = update.payrollId?.trim() || null
    const normalizedPayrollId = payrollId?.toLowerCase() ?? null
    if (normalizedPayrollId && payrollIds.has(normalizedPayrollId)) {
      throw new Error("Each payroll ID can only be assigned once.")
    }
    if (normalizedPayrollId) payrollIds.add(normalizedPayrollId)
    return { employeeId: update.employeeId, payrollId }
  })
}
export { normalizePayrollUpdates }
