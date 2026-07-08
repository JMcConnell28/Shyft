"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { companyQueryKeys } from "@/features/company/query-keys"
import {
  getCompanyEmployeePageData,
  getCompanyEmployeesPageData,
} from "@/features/company/server-fns"

function useCompanyEmployeesQuery(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const getCompanyEmployeesPageDataFn = useServerFn(getCompanyEmployeesPageData)

  return useQuery({
    queryKey: companyQueryKeys.employees(input),
    queryFn: () => getCompanyEmployeesPageDataFn({ data: input }),
  })
}

function useCompanyEmployeeQuery(input: {
  employeeId: string
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const getCompanyEmployeePageDataFn = useServerFn(getCompanyEmployeePageData)

  return useQuery({
    queryKey: companyQueryKeys.employee(input),
    queryFn: () => getCompanyEmployeePageDataFn({ data: input }),
  })
}

export { useCompanyEmployeeQuery, useCompanyEmployeesQuery }
