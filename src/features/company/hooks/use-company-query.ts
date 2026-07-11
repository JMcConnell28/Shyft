"use client"

import { useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import {
  companyEmployeeQueryOptions,
  companyEmployeesQueryOptions,
} from "@/features/company/query-options"
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

  return useQuery(
    companyEmployeesQueryOptions(input, getCompanyEmployeesPageDataFn)
  )
}

function useCompanyEmployeeQuery(input: {
  employeeId: string
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const getCompanyEmployeePageDataFn = useServerFn(getCompanyEmployeePageData)

  return useQuery(
    companyEmployeeQueryOptions(input, getCompanyEmployeePageDataFn)
  )
}

export { useCompanyEmployeeQuery, useCompanyEmployeesQuery }
