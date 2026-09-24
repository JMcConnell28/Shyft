"use client"

import * as React from "react"
import { IdCardIcon, UserRoundCheckIcon, UsersIcon } from "lucide-react"

import { CompanyEmployeeListRow } from "@/features/company/components/company-employee-list-row"
import { SageEmployeeImportDialog } from "@/features/company/components/sage-employee-import-dialog"
import { useCompanyEmployeesQuery } from "@/features/company/hooks/use-company-query"
import { getCompanyRoleLabel } from "@/features/company/utils/roles"
import {
  ResourceMetric,
  ResourcePageHeader,
  ResourceSearch,
} from "@/features/settings/components/resource-settings-page"
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
  const [search, setSearch] = React.useState("")
  const [view, setView] = React.useState<"current" | "former">("current")
  const companyQuery = useCompanyEmployeesQuery({
    organizationId,
    locationId,
    userId,
  })

  if (companyQuery.isPending) {
    return <CompanyState message="Loading employees..." />
  }
  if (companyQuery.isError) {
    return (
      <CompanyState
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
  const employeesForView =
    view === "current" ? currentEmployees : formerEmployees
  const normalizedSearch = search.trim().toLowerCase()
  const employees = normalizedSearch
    ? employeesForView.filter((employee) =>
        `${employee.name} ${employee.email ?? ""} ${employee.payrollId ?? ""} ${getCompanyRoleLabel(employee.role)}`
          .toLowerCase()
          .includes(normalizedSearch)
      )
    : employeesForView

  return (
    <div className="space-y-5 text-[#11245a]">
      <ResourcePageHeader
        title="Employees"
        description={`Manage account access, pay and location activity for ${companyQuery.data.workspaceName}.`}
        action={
          <SageEmployeeImportDialog
            employees={currentEmployees}
            locationId={locationId}
            organizationId={organizationId}
            userId={userId}
          />
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <ResourceMetric
          icon={UsersIcon}
          label="Current employees"
          value={currentEmployees.length}
        />
        <ResourceMetric
          icon={UserRoundCheckIcon}
          label="Active employees"
          tone="green"
          value={
            currentEmployees.filter((employee) => employee.status === "active")
              .length
          }
        />
        <div className="col-span-2 md:col-span-1">
          <ResourceMetric
            icon={IdCardIcon}
            label="Payroll IDs"
            tone="purple"
            value={
              currentEmployees.filter((employee) => Boolean(employee.payrollId))
                .length
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {organizationId ? (
          <div
            role="group"
            aria-label="Employee status"
            className="inline-flex self-start rounded-lg border border-[#dfe5f0] bg-white p-1"
          >
            <StatusButton
              active={view === "current"}
              label={`Current (${currentEmployees.length})`}
              onClick={() => setView("current")}
            />
            <StatusButton
              active={view === "former"}
              label={`Former (${formerEmployees.length})`}
              onClick={() => setView("former")}
            />
          </div>
        ) : null}
        <div className="w-full sm:ml-auto sm:max-w-72">
          <ResourceSearch
            value={search}
            onChange={setSearch}
            placeholder="Search employees..."
          />
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-[#dfe5f0] bg-white shadow-[0_8px_24px_rgba(30,50,96,0.045)]">
        <div className="hidden grid-cols-[2.5rem_minmax(0,1.5fr)_0.7fr_0.7fr_0.6fr_1rem] items-center gap-3 border-b border-[#dfe5f0] px-5 py-3 text-[11px] font-semibold tracking-wide text-[#61709a] uppercase md:grid">
          <span />
          <span>Employee</span>
          <span>Role</span>
          <span>Payroll ID</span>
          <span>Locations</span>
          <span />
        </div>
        {employees.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center px-5 py-8 text-center">
            <UsersIcon className="size-5 text-[#0968f5]" />
            <p className="mt-3 text-sm font-bold">
              {employeesForView.length === 0
                ? view === "former"
                  ? "No former employees"
                  : "No employees yet"
                : "No matching employees"}
            </p>
            <p className="mt-1 text-xs text-[#61709a]">
              {employeesForView.length === 0
                ? view === "former"
                  ? "Employees you remove from the organisation will appear here."
                  : "Invited staff will appear here once they join."
                : "Try a different name, email or role."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#e7ebf3]">
            {employees.map((employee) => (
              <CompanyEmployeeListRow
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

function StatusButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-[#eef3ff] text-[#0968f5]"
          : "text-[#61709a] hover:bg-[#f6f8fc] hover:text-[#10204b]"
      )}
    >
      {label}
    </button>
  )
}

function CompanyState({ message }: { message: string }) {
  return (
    <section className="rounded-xl border border-[#dfe5f0] bg-white p-6 text-center text-sm font-medium text-[#61709a]">
      {message}
    </section>
  )
}

export { CompanyEmployeeListPage }
