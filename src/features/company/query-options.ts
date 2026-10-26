import { queryOptions } from "@tanstack/react-query"

import type { CompanyScopeInput } from "@/features/company/types"
import { companyQueryKeys } from "@/features/company/query-keys"
import {
  getCompanyEmployeePageData,
  getCompanyEmployeesPageData,
  getSageEmployeeImportAvailability,
} from "@/features/company/server-fns"

function companyEmployeesQueryOptions(
  input: CompanyScopeInput,
  fetcher: (options: {
    data: CompanyScopeInput
  }) => ReturnType<
    typeof getCompanyEmployeesPageData
  > = getCompanyEmployeesPageData
) {
  return queryOptions({
    queryKey: companyQueryKeys.employees(input),
    queryFn: () => fetcher({ data: input }),
    staleTime: 60_000,
  })
}

function companyEmployeeQueryOptions(
  input: CompanyScopeInput & { employeeId: string },
  fetcher: (options: {
    data: CompanyScopeInput & { employeeId: string }
  }) => ReturnType<
    typeof getCompanyEmployeePageData
  > = getCompanyEmployeePageData
) {
  return queryOptions({
    queryKey: companyQueryKeys.employee(input),
    queryFn: () => fetcher({ data: input }),
    staleTime: 60_000,
  })
}

export { companyEmployeeQueryOptions, companyEmployeesQueryOptions }
function sageEmployeeImportQueryOptions(
  input: CompanyScopeInput,
  fetcher: (options: {
    data: CompanyScopeInput
  }) => ReturnType<
    typeof getSageEmployeeImportAvailability
  > = getSageEmployeeImportAvailability
) {
  return queryOptions({
    queryKey: companyQueryKeys.sageImportAccess(input),
    queryFn: () => fetcher({ data: input }),
    staleTime: 0,
    refetchInterval: 20000,
    refetchOnWindowFocus: "always",
  })
}
export { sageEmployeeImportQueryOptions }
export type { CompanyScopeInput }
