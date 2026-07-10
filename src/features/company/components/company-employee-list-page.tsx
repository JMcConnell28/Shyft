"use client"

import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  ChevronRightIcon,
  LoaderCircleIcon,
  SearchIcon,
  TriangleAlertIcon,
  UsersRoundIcon,
} from "lucide-react"

import type { CompanyEmployeeListItem } from "@/features/company/types"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SageEmployeeImportDialog } from "@/features/company/components/sage-employee-import-dialog"
import { useCompanyEmployeesQuery } from "@/features/company/hooks/use-company-query"
import { getCompanyRoleLabel } from "@/features/company/utils/roles"
import { getErrorMessage } from "@/lib/errors"
import { cn } from "@/lib/utils"

function CompanyEmployeeListPage({
  organizationId,
  locationId,
  userId,
  workspaceSlug,
}: {
  organizationId?: string
  locationId?: string
  userId: string
  workspaceSlug: string
}) {
  const [query, setQuery] = React.useState("")
  const [view, setView] = React.useState<"current" | "former">("current")
  const companyQuery = useCompanyEmployeesQuery({
    organizationId,
    locationId,
    userId,
  })

  if (companyQuery.isPending) {
    return (
      <CompanyState icon={LoaderCircleIcon} message="Loading employees..." />
    )
  }

  if (companyQuery.isError) {
    return (
      <CompanyState
        icon={TriangleAlertIcon}
        message={getErrorMessage(
          companyQuery.error,
          "We could not load your company staff right now."
        )}
      />
    )
  }

  const currentEmployees = companyQuery.data.employees.filter(
    (employee) => employee.offboardedAt === null
  )
  const formerEmployees = organizationId
    ? companyQuery.data.employees.filter(
        (employee) => employee.offboardedAt !== null
      )
    : []
  const employeesForView = view === "current" ? currentEmployees : formerEmployees
  const normalizedQuery = query.trim().toLowerCase()
  const employees = normalizedQuery
    ? employeesForView.filter((employee) =>
        `${employee.name} ${employee.email ?? ""} ${employee.payrollId ?? ""} ${getCompanyRoleLabel(employee.role)}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : employeesForView
  const activeCount = currentEmployees.filter(
    (employee) => employee.status === "active"
  ).length
  const payrollLinkedCount = currentEmployees.filter((employee) =>
    Boolean(employee.payrollId)
  ).length

  return (
    <div className="space-y-4 text-[#11245a]">
      <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-[-0.035em]">
              Employees
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#61709a]">
              Manage account access, pay, and location activity for{" "}
              {companyQuery.data.workspaceName}.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-72">
            <StatPill
              label="Employees"
              value={currentEmployees.length}
            />
            <StatPill label="Active" value={activeCount} />
            <StatPill label="Payroll IDs" value={payrollLinkedCount} />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label className="relative block flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7c87a8]" />
            <Input
              className="h-11 rounded-xl border-[#dfe5f0] bg-[#f8faff] pl-9 text-sm font-semibold shadow-none"
              placeholder="Search employees"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <SageEmployeeImportDialog
            employees={currentEmployees}
            locationId={locationId}
            organizationId={organizationId}
            userId={userId}
          />
        </div>
        {organizationId ? (
          <div className="mt-4 inline-flex rounded-xl bg-[#f2f5fb] p-1 text-sm font-extrabold">
          <button
            type="button"
            className={cn(
              "rounded-lg px-3 py-1.5 transition-colors",
              view === "current"
                ? "bg-white text-[#11245a] shadow-sm"
                : "text-[#61709a]"
            )}
            onClick={() => setView("current")}
          >
            Current ({currentEmployees.length})
          </button>
          <button
            type="button"
            className={cn(
              "rounded-lg px-3 py-1.5 transition-colors",
              view === "former"
                ? "bg-white text-[#11245a] shadow-sm"
                : "text-[#61709a]"
            )}
            onClick={() => setView("former")}
          >
            Former ({formerEmployees.length})
          </button>
          </div>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
        {employees.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center p-6 text-center">
            <UsersRoundIcon className="size-5 text-[#0069ff]" />
            <p className="mt-3 text-sm font-extrabold">
              {employeesForView.length === 0
                ? view === "former"
                  ? "No former employees"
                  : "No employees yet"
                : "No matching employees"}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#61709a]">
              {employeesForView.length === 0
                ? view === "former"
                  ? "Employees you remove from the organisation will appear here."
                  : "Invited staff will appear here once they join."
                : "Try a different name, email, or role."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#edf0f6]">
            {employees.map((employee) => (
              <EmployeeListRow
                key={employee.id}
                employee={employee}
                workspaceSlug={workspaceSlug}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function EmployeeListRow({
  employee,
  workspaceSlug,
}: {
  employee: CompanyEmployeeListItem
  workspaceSlug: string
}) {
  return (
    <Link
      to="/w/$workspaceSlug/settings/company/$employeeId"
      params={{ employeeId: employee.id, workspaceSlug }}
      className="grid min-h-20 grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-[#f8faff] active:bg-[#eef3ff] sm:grid-cols-[2.75rem_minmax(0,1fr)_9rem_8rem_auto]"
    >
      <span className="flex size-11 items-center justify-center rounded-xl bg-[#eef3ff] text-sm font-extrabold text-[#0069ff]">
        {getInitials(employee.name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-extrabold">
          {employee.name}
        </span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-[#61709a]">
          {employee.email ?? "No email yet"}
        </span>
      </span>
      <RoleBadge role={employee.role} />
      <span className="hidden min-w-0 text-xs font-bold text-[#61709a] sm:block">
        <span className="block truncate">
          {employee.payrollId
            ? `Payroll ${employee.payrollId}`
            : "No payroll ID"}
        </span>
        <span className="block truncate">
          {employee.activeLocationCount}/{employee.locationCount} active
        </span>
      </span>
      <ChevronRightIcon className="size-4 text-[#7c87a8]" />
    </Link>
  )
}

function RoleBadge({ role }: { role: CompanyEmployeeListItem["role"] }) {
  const label = getCompanyRoleLabel(role)

  return (
    <Badge
      variant="outline"
      className={cn(
        "hidden h-7 rounded-lg border-0 px-2.5 text-xs font-extrabold sm:inline-flex",
        role === "admin" || role === "owner"
          ? "bg-[#eef3ff] text-[#0069ff]"
          : "bg-[#f2f5fb] text-[#405078]"
      )}
    >
      {label}
    </Badge>
  )
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[#f2f5fb] px-3 py-2">
      <p className="text-[11px] font-bold text-[#61709a]">{label}</p>
      <p className="mt-0.5 text-lg font-extrabold">{value}</p>
    </div>
  )
}

function CompanyState({
  icon: Icon,
  message,
}: {
  icon: typeof LoaderCircleIcon
  message: string
}) {
  return (
    <section className="flex min-h-44 flex-col items-center justify-center rounded-xl bg-white p-6 text-center text-sm font-semibold text-[#61709a] shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <Icon className="mb-3 size-5 text-[#0069ff]" />
      {message}
    </section>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export { CompanyEmployeeListPage }
