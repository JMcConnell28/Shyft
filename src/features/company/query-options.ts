import { queryOptions } from "@tanstack/react-query"

import { companyQueryKeys } from "@/features/company/query-keys"
import {
  getCompanyEmployeePageData,
  getCompanyEmployeesPageData,
} from "@/features/company/server-fns"

type CompanyScopeInput = {
  organizationId?: string
  locationId?: string
  userId: string
}

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
export type { CompanyScopeInput }
