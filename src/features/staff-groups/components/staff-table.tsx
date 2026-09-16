"use client"

import * as React from "react"
import { SearchIcon, UsersIcon } from "lucide-react"

import type {
  StaffGroupSettingsEmployee,
  StaffGroupSettingsGroup,
} from "@/features/staff-groups/types"

import { Button } from "@/components/ui/button"
import { StaffTableRow } from "@/features/staff-groups/components/staff-table-row"
import { filterTeamEmployees } from "@/features/staff-groups/utils/team-settings"

const PAGE_SIZE = 20

function StaffTable({
  employees,
  groups,
  pending,
  search,
  status,
  onAssign,
}: {
  employees: Array<StaffGroupSettingsEmployee>
  groups: Array<StaffGroupSettingsGroup>
  pending: boolean
  search: string
  status: "all" | "active" | "inactive"
  onAssign: (employeeId: string, groupId: string) => Promise<void>
}) {
  const [page, setPage] = React.useState(1)
  const filteredEmployees = React.useMemo(
    () => filterTeamEmployees(employees, { search, status }),
    [employees, search, status]
  )
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visibleEmployees = filteredEmployees.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )

  React.useEffect(() => setPage(1), [search, status])

  if (employees.length === 0) {
    return <TeamEmptyState icon={UsersIcon} message="No active staff assignments at this location yet." />
  }

  if (filteredEmployees.length === 0) {
    return <TeamEmptyState icon={SearchIcon} message="No team members match these filters." />
  }

  return (
    <section className="md:overflow-hidden md:rounded-xl md:border md:border-[#dfe5f0] md:bg-white md:shadow-[0_5px_18px_rgba(30,50,96,0.04)]">
      <div className="hidden grid-cols-[minmax(13rem,1.35fr)_minmax(8rem,.7fr)_minmax(10rem,.9fr)_6rem_minmax(12rem,1fr)] gap-4 border-b border-[#dfe5f0] px-4 py-3 text-[11px] font-semibold text-[#536286] md:grid">
        <span>Employee</span>
        <span>Role</span>
        <span>Group</span>
        <span>Status</span>
        <span>Contact</span>
      </div>

      <div className="space-y-2.5 md:space-y-0">
        {visibleEmployees.map((employee) => (
          <StaffTableRow
            key={employee.id}
            employee={employee}
            groups={groups}
            pending={pending}
            onAssign={onAssign}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-[#dfe5f0] bg-white px-3 py-2 text-xs text-[#61709a] md:mt-0 md:rounded-none md:border-x-0 md:border-b-0">
          <span>
            Page {safePage} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={safePage === 1}
              onClick={() => setPage(safePage - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={safePage === totalPages}
              onClick={() => setPage(safePage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function TeamEmptyState({
  icon: Icon,
  message,
}: {
  icon: typeof UsersIcon
  message: string
}) {
  return (
    <div className="rounded-xl border border-[#dfe5f0] bg-white px-5 py-12 text-center shadow-[0_5px_18px_rgba(30,50,96,0.04)]">
      <Icon className="mx-auto size-5 text-[#0968f5]" />
      <p className="mt-3 text-sm font-semibold text-[#10204b]">{message}</p>
    </div>
  )
}

export { StaffTable }
