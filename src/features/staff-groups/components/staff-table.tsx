"use client"

import * as React from "react"
import { SearchIcon, UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { RemoveStaffMemberDialog } from "@/features/staff-groups/components/remove-staff-member-dialog"
import { StaffTableRow } from "@/features/staff-groups/components/staff-table-row"
import type {
  StaffGroupSettingsEmployee,
  StaffGroupSettingsGroup,
} from "@/features/staff-groups/types"

const PAGE_SIZE = 20

function StaffTable({
  employees,
  groups,
  pending,
  scopeLabel,
  onAssign,
  onBulkAssign,
  onRemove,
  onSetActive,
}: {
  employees: StaffGroupSettingsEmployee[]
  groups: StaffGroupSettingsGroup[]
  pending: boolean
  scopeLabel: "location" | "organisation"
  onAssign: (employeeId: string, groupId: string) => Promise<void>
  onBulkAssign: (employeeIds: string[], groupId: string) => Promise<void>
  onRemove: (employeeId: string) => Promise<void>
  onSetActive: (employeeId: string, isActive: boolean) => Promise<void>
}) {
  const [query, setQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [bulkGroupId, setBulkGroupId] = React.useState(groups[0]?.id ?? "")
  const [employeeToRemove, setEmployeeToRemove] =
    React.useState<StaffGroupSettingsEmployee | null>(null)

  const filteredEmployees = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return employees

    return employees.filter((employee) =>
      `${employee.name} ${employee.email ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery)
    )
  }, [employees, query])
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / PAGE_SIZE)
  )
  const safePage = Math.min(page, totalPages)
  const visibleEmployees = filteredEmployees.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )
  const selectedSet = new Set(selectedIds)
  const allVisibleSelected =
    visibleEmployees.length > 0 &&
    visibleEmployees.every((employee) => selectedSet.has(employee.id))

  React.useEffect(() => setPage(1), [query])
  React.useEffect(() => {
    if (!groups.some((group) => group.id === bulkGroupId)) {
      setBulkGroupId(groups[0]?.id ?? "")
    }
  }, [bulkGroupId, groups])
  React.useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) => employees.some((employee) => employee.id === id))
    )
  }, [employees])

  function toggleVisible(checked: boolean) {
    const visibleIds = visibleEmployees.map((employee) => employee.id)
    setSelectedIds((current) =>
      checked
        ? Array.from(new Set([...current, ...visibleIds]))
        : current.filter((id) => !visibleIds.includes(id))
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Staff</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {employees.length} team member{employees.length === 1 ? "" : "s"}
          </p>
        </div>
        <label className="relative w-full sm:max-w-64">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search staff"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      {selectedIds.length > 0 ? (
        <div className="flex flex-col gap-2 border-b border-border/70 bg-primary/5 px-3 py-3 sm:flex-row sm:items-center">
          <span className="text-xs font-medium">
            {selectedIds.length} selected
          </span>
          <NativeSelect
            className="w-full sm:ml-auto sm:w-48"
            value={bulkGroupId}
            onChange={(event) => setBulkGroupId(event.target.value)}
          >
            {groups.map((group) => (
              <NativeSelectOption key={group.id} value={group.id}>
                {group.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button
            type="button"
            size="sm"
            disabled={pending || !bulkGroupId}
            onClick={() => {
              void onBulkAssign(selectedIds, bulkGroupId).then(() =>
                setSelectedIds([])
              )
            }}
          >
            Assign group
          </Button>
        </div>
      ) : null}

      {employees.length === 0 ? (
        <div className="py-12 text-center">
          <UsersIcon className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No staff yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Invited team members will appear here.
          </p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="py-12 text-center">
          <SearchIcon className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No matching staff</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try a different name or email address.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden grid-cols-[2rem_minmax(11rem,1fr)_minmax(9rem,11rem)_5rem_2.5rem] items-center gap-3 border-b border-border/70 px-2 py-2 text-[11px] font-medium text-muted-foreground md:grid">
            <Checkbox
              checked={allVisibleSelected}
              onCheckedChange={(checked) => toggleVisible(Boolean(checked))}
            />
            <span>Team member</span>
            <span>Group</span>
            <span className="text-center">Active</span>
            <span />
          </div>

          <div className="divide-y divide-border/70">
            {visibleEmployees.map((employee) => (
              <StaffTableRow
                key={employee.id}
                employee={employee}
                groups={groups}
                pending={pending}
                selected={selectedSet.has(employee.id)}
                onAssign={onAssign}
                onRemove={() => setEmployeeToRemove(employee)}
                onSelect={(checked) =>
                  setSelectedIds((current) =>
                    checked
                      ? Array.from(new Set([...current, employee.id]))
                      : current.filter((id) => id !== employee.id)
                  )
                }
                onSetActive={onSetActive}
              />
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border/70 pt-4 text-xs text-muted-foreground">
            <span>
              {filteredEmployees.length} result
              {filteredEmployees.length === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
              >
                Previous
              </Button>
              <span>
                {safePage} / {totalPages}
              </span>
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
        </>
      )}

      <RemoveStaffMemberDialog
        employee={employeeToRemove}
        pending={pending}
        scopeLabel={scopeLabel}
        onClose={() => setEmployeeToRemove(null)}
        onConfirm={onRemove}
      />
    </div>
  )
}

export { StaffTable }
