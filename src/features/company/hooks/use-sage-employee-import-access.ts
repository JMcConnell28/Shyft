import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { getSageEmployeeImportAvailability } from "../server-fns"
import { sageEmployeeImportQueryOptions } from "../query-options"
import type { CompanyScopeInput } from "../types"

function useSageEmployeeImportAccess(input: CompanyScopeInput): boolean {
  const fetcher = useServerFn(getSageEmployeeImportAvailability)
  const query = useQuery(sageEmployeeImportQueryOptions(input, fetcher))
  return query.data === true
}
export { useSageEmployeeImportAccess }
