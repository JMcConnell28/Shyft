import { beforeEach, expect, it, vi } from "vitest"
import {
  bulkUpdateCompanyEmployeePayrollIds,
  updateCompanyEmployeePayrollId,
} from "./employee-payroll"

const { context, gate, employeeScope, query } = vi.hoisted(() => ({
  context: vi.fn(),
  gate: vi.fn(),
  employeeScope: vi.fn(),
  query: vi.fn(),
}))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("./shared", () => ({ requireCompanyAdminContext: context }))
vi.mock("./employee-access", () => ({ assertEmployeesInScope: employeeScope }))
vi.mock("./sage-import-access", () => ({
  requireSageEmployeeImportAccess: gate,
}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
const trustedScope = {
  organizationId: "business",
  locationId: null,
  userId: "admin",
}
const input = {
  organizationId: "business",
  userId: "admin",
  updates: [{ employeeId: "employee", payrollId: " PAY-1 " }],
}
beforeEach(() => {
  vi.resetAllMocks()
  context.mockResolvedValue(trustedScope)
  query.mockResolvedValue({ rows: [] })
})

it("blocks a direct bulk import before changing any employee payroll IDs", async () => {
  gate.mockRejectedValue(new Error("Sage employee imports unavailable"))
  await expect(bulkUpdateCompanyEmployeePayrollIds(input)).rejects.toThrow(
    "unavailable"
  )
  expect(gate).toHaveBeenCalledWith(trustedScope)
  expect(query).not.toHaveBeenCalled()
  expect(employeeScope).not.toHaveBeenCalled()
})
it("allows an authorized import when enabled and normalizes payroll references", async () => {
  await expect(bulkUpdateCompanyEmployeePayrollIds(input)).resolves.toEqual([
    { employeeId: "employee", payrollId: "PAY-1" },
  ])
  expect(employeeScope).toHaveBeenCalledWith(trustedScope, ["employee"])
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining("update public.employees"),
    ["employee", "PAY-1"]
  )
})
it("leaves manual payroll ID edits available when imports are disabled", async () => {
  gate.mockRejectedValue(new Error("Sage imports disabled"))
  await expect(
    updateCompanyEmployeePayrollId({
      organizationId: "business",
      userId: "admin",
      employeeId: "employee",
      payrollId: "PAY-2",
    })
  ).resolves.toEqual({ employeeId: "employee", payrollId: "PAY-2" })
  expect(gate).not.toHaveBeenCalled()
  expect(employeeScope).toHaveBeenCalled()
  expect(query).toHaveBeenCalledTimes(1)
})
it("checks authorization before reading feature availability", async () => {
  context.mockRejectedValue(new Error("No staff management permission"))
  await expect(bulkUpdateCompanyEmployeePayrollIds(input)).rejects.toThrow(
    "permission"
  )
  expect(gate).not.toHaveBeenCalled()
  expect(query).not.toHaveBeenCalled()
})
it("retains payroll ID duplicate validation without partial writes", async () => {
  await expect(
    bulkUpdateCompanyEmployeePayrollIds({
      ...input,
      updates: [
        input.updates[0],
        { employeeId: "other-employee", payrollId: "pay-1" },
      ],
    })
  ).rejects.toThrow("Each payroll ID")
  expect(query).not.toHaveBeenCalled()
})
