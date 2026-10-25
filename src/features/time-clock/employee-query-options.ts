import { queryOptions } from "@tanstack/react-query"
import { timeClockQueryKeys } from "./query-keys"
import { getEmployeeClockPageData } from "./server-fns"
import type { EmployeeClockPageData } from "./types"

function employeeClockQueryOptions(
  input: { scanSessionId: string; userId: string },
  initialData: EmployeeClockPageData,
  fetcher: (options: {
    data: typeof input
  }) => Promise<EmployeeClockPageData> = getEmployeeClockPageData
) {
  return queryOptions({
    queryKey: timeClockQueryKeys.employee(input),
    queryFn: () => fetcher({ data: input }),
    initialData,
    staleTime: 30_000,
  })
}

export { employeeClockQueryOptions }
