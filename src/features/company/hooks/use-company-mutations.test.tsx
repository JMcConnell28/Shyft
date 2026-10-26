// @vitest-environment jsdom
import * as React from "react"
import { act, cleanup, renderHook } from "@testing-library/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { afterEach, beforeEach, expect, it, vi } from "vitest"

import { useCompanyMutations } from "./use-company-mutations"
import { createQueryClient } from "@/lib/query-client"

const { serverAction, errorToast, successToast } = vi.hoisted(() => ({
  serverAction: vi.fn(),
  errorToast: vi.fn(),
  successToast: vi.fn(),
}))
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }))
vi.mock("@/lib/toast", () => ({
  showErrorToast: errorToast,
  showSuccessToast: successToast,
}))
vi.mock("@/features/company/server-fns", () =>
  Object.fromEntries(
    [
      "archiveCompanyEmployeeRotaNote",
      "bulkUpdateCompanyEmployeePayrollIds",
      "createCompanyEmployeeRotaNote",
      "rehireCompanyEmployee",
      "removeCompanyEmployee",
      "updateCompanyEmployeeCompensation",
      "updateCompanyEmployeeLocationActivity",
      "updateCompanyEmployeePayrollId",
      "updateCompanyEmployeeRole",
      "updateCompanyEmployeeRotaNote",
      "updateCompanyEmployeeRotaVisibility",
    ].map((name) => [name, serverAction])
  )
)
vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const actual: typeof React = createRequire(import.meta.url)("react")
  return { ...actual, default: actual }
})

const clients: Array<ReturnType<typeof createQueryClient>> = []
function renderCompanyMutations() {
  const client = createQueryClient()
  clients.push(client)
  return renderHook(
    () =>
      useCompanyMutations({ organizationId: "organization", userId: "user" }),
    {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        React.createElement(QueryClientProvider, { client }, children),
    }
  )
}
beforeEach(() => vi.resetAllMocks())
afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
})

it("shows one error toast when activating an employee at another location fails", async () => {
  const error = new Error("That employee could not be found.")
  serverAction.mockRejectedValue(error)
  const { result } = renderCompanyMutations()
  await act(async () => {
    await expect(
      result.current.locationActivityMutation.mutateAsync({
        employeeId: "employee",
        isActive: true,
        targetLocationId: "second-location",
      })
    ).rejects.toThrow(error.message)
  })
  expect(errorToast).toHaveBeenCalledExactlyOnceWith(error, {
    fallbackMessage: "We could not update that location.",
  })
  expect(successToast).not.toHaveBeenCalled()
})
it("keeps the company-specific fallback when a failure has no useful message", async () => {
  serverAction.mockRejectedValue(null)
  const { result } = renderCompanyMutations()
  await act(async () => {
    await expect(
      result.current.payrollIdMutation.mutateAsync({
        employeeId: "employee",
        payrollId: "PAY-1",
      })
    ).rejects.toBeNull()
  })
  expect(errorToast).toHaveBeenCalledExactlyOnceWith(null, {
    fallbackMessage: "We could not update that payroll ID.",
  })
})
it("still shows one success toast when location activation succeeds", async () => {
  serverAction.mockResolvedValue({
    employeeId: "employee",
    isActive: true,
    locationId: "second-location",
  })
  const { result } = renderCompanyMutations()
  await act(async () => {
    await result.current.locationActivityMutation.mutateAsync({
      employeeId: "employee",
      isActive: true,
      targetLocationId: "second-location",
    })
  })
  expect(successToast).toHaveBeenCalledExactlyOnceWith(
    "Location activity updated."
  )
  expect(errorToast).not.toHaveBeenCalled()
})
