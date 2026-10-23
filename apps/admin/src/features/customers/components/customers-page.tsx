import { useDeferredValue, useState } from "react"
import { Link } from "@tanstack/react-router"

import { customerStageLabels } from "../constants"
import { customerStages } from "../schemas"
import { useCustomers } from "../hooks/use-customers"
import { CustomerStageBadge } from "./customer-stage-badge"
import type { CustomerListInput } from "../schemas"
import { formatDateTime } from "@/lib/utils"
import {
  DataTable,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"

function CustomersPage() {
  const [filters, setFilters] = useState<CustomerListInput>({
    search: "",
    stage: "all",
    page: 1,
  })
  const search = useDeferredValue(filters.search)
  const query = useCustomers({ ...filters, search })
  const data = query.data
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-slate-500">
          Every customer, from onboarding and trial through payment and station
          dispatch.
        </p>
      </header>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1 text-sm font-medium">
          Search customers
          <input
            className="mt-1 block h-10 w-full rounded-md border border-slate-200 bg-white px-3"
            value={filters.search}
            maxLength={120}
            placeholder="Customer name or email"
            onChange={(event) =>
              setFilters({ ...filters, search: event.target.value, page: 1 })
            }
          />
        </label>
        <label className="text-sm font-medium">
          Stage
          <select
            className="mt-1 block h-10 rounded-md border border-slate-200 bg-white px-3"
            value={filters.stage}
            onChange={(event) =>
              setFilters({
                ...filters,
                stage: event.target.value as CustomerListInput["stage"],
                page: 1,
              })
            }
          >
            <option value="all">All stages</option>
            {customerStages.map((stage) => (
              <option key={stage} value={stage}>
                {customerStageLabels[stage]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {query.isPending && <p role="status">Loading customers…</p>}
      {query.isError && (
        <p role="alert">
          Could not load customers.{" "}
          <Button variant="secondary" onClick={() => query.refetch()}>
            Try again
          </Button>
        </p>
      )}
      {data && (
        <>
          <p className="text-sm text-slate-500">{data.total} customers</p>
          <DataTable>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Customer</TableHeaderCell>
                <TableHeaderCell>Stage</TableHeaderCell>
                <TableHeaderCell>Locations</TableHeaderCell>
                <TableHeaderCell>T&A locations</TableHeaderCell>
                <TableHeaderCell>Stations needed</TableHeaderCell>
                <TableHeaderCell>Joined</TableHeaderCell>
              </TableRow>
            </TableHead>
            <tbody>
              {data.customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell label="Customer">
                    <Link
                      className="font-semibold text-blue-700 hover:underline"
                      to="/customers/$customerId"
                      params={{ customerId: customer.id }}
                    >
                      {customer.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {customer.email ?? "No contact email"}
                    </p>
                  </TableCell>
                  <TableCell label="Stage">
                    <CustomerStageBadge stage={customer.stage} />
                  </TableCell>
                  <TableCell label="Locations">
                    {customer.locationCount}
                  </TableCell>
                  <TableCell label="T&A locations">
                    {customer.addonCount}
                  </TableCell>
                  <TableCell label="Stations needed">
                    {customer.stationsNeeded > 0 ? (
                      <span className="font-semibold text-amber-700">
                        {customer.stationsNeeded} to prepare
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell label="Joined">
                    {formatDateTime(customer.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </DataTable>
          {data.customers.length === 0 && (
            <p className="py-6 text-sm text-slate-500">
              No customers match these filters.
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              disabled={filters.page === 1 || query.isFetching}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-500">
              Page {filters.page} of {Math.max(1, Math.ceil(data.total / 50))}
            </span>
            <Button
              variant="secondary"
              disabled={filters.page * 50 >= data.total || query.isFetching}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
export { CustomersPage }
