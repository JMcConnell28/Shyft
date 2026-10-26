import "@tanstack/react-start/server-only"

import { normalizePayrollUpdates } from "../utils/normalize-payroll-updates"
import { assertEmployeesInScope } from "./employee-access"
import { requireCompanyAdminContext } from "./shared"
import { requireSageEmployeeImportAccess } from "./sage-import-access"
import type { CompanyEmployeePayrollUpdate, CompanyScopeInput } from "../types"
import { getDatabase } from "@/lib/db"

type PayrollUpdateContext = Awaited<
  ReturnType<typeof requireCompanyAdminContext>
>
async function updateCompanyEmployeePayrollId(
  input: CompanyScopeInput & {
    employeeId: string
    payrollId: string | null
  }
): Promise<CompanyEmployeePayrollUpdate> {
  const context = await requireCompanyAdminContext(input)
  const [result] = await updateCompanyEmployeePayrollIds(context, [
    { employeeId: input.employeeId, payrollId: input.payrollId },
  ])
  return result
}

async function bulkUpdateCompanyEmployeePayrollIds(
  input: CompanyScopeInput & {
    updates: Array<CompanyEmployeePayrollUpdate>
  }
): Promise<Array<CompanyEmployeePayrollUpdate>> {
  const context = await requireCompanyAdminContext(input)
  await requireSageEmployeeImportAccess(context)
  return updateCompanyEmployeePayrollIds(context, input.updates)
}

async function updateCompanyEmployeePayrollIds(
  context: PayrollUpdateContext,
  input: Array<CompanyEmployeePayrollUpdate>
): Promise<Array<CompanyEmployeePayrollUpdate>> {
  const updates = normalizePayrollUpdates(input)
  await assertEmployeesInScope(
    context,
    updates.map((update) => update.employeeId)
  )
  for (const update of updates) {
    await getDatabase().query(
      `update public.employees set payroll_id = nullif(trim($2::text), ''),
       updated_at = timezone('utc', now()) where id = $1::uuid`,
      [update.employeeId, update.payrollId]
    )
  }
  return updates
}
export { bulkUpdateCompanyEmployeePayrollIds, updateCompanyEmployeePayrollId }
