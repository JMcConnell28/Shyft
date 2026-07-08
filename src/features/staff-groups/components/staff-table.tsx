"use client"

import * as React from "react"
import { SearchIcon, UsersIcon } from "lucide-react"

import type {
  StaffGroupSettingsEmployee,
  StaffGroupSettingsGroup,
} from "@/features/staff-groups/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { StaffTableRow } from "@/features/staff-groups/components/staff-table-row"

const PAGE_SIZE = 20

function StaffTable({
  employees,
  groups,
  pending,
  onAssign,
  onBulkAssign,
}: {
  employees: Array<StaffGroupSettingsEmployee>
  groups: Array<StaffGroupSettingsGroup>
  pending: boolean
  onAssign: (employeeId: string, groupId: string) => Promise<void>
  onBulkAssign: (employeeIds: Array<string>, groupId: string) => Promise<void>
}) {
  const [query, setQuery] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [selectedIds, setSelectedIds] = React.useState<Array<string>>([])
  const [bulkGroupId, setBulkGroupId] = React.useState(groups[0]?.id ?? "")

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
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <div className="flex flex-col gap-3 border-b border-[#edf0f6] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.035em] text-[#11245a]">
            Team
          </h2>
          <p className="mt-1 text-sm font-semibold text-[#61709a]">
            Assign employees to the groups used by the rota builder.
          </p>
        </div>
        <label className="relative w-full sm:max-w-64">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7c87a8]" />
          <Input
            className="h-10 rounded-xl border-[#dfe5f0] bg-[#f8faff] pl-9 text-sm font-semibold shadow-none"
            placeholder="Search team"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      {selectedIds.length > 0 ? (
        <div className="flex flex-col gap-2 border-b border-[#dfe7ff] bg-[#f5f8ff] px-4 py-3 sm:flex-row sm:items-center">
          <span className="text-xs font-extrabold text-[#11245a]">
            {selectedIds.length} selected
          </span>
          <NativeSelect
            className="h-9 w-full rounded-lg border-[#cddcff] bg-white text-xs font-bold sm:ml-auto sm:w-48"
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
          <UsersIcon className="mx-auto size-5 text-[#0069ff]" />
          <p className="mt-3 text-sm font-extrabold text-[#11245a]">
            No staff yet
          </p>
          <p className="mt-1 text-xs font-semibold text-[#61709a]">
            Invited team members will appear here.
          </p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="py-12 text-center">
          <SearchIcon className="mx-auto size-5 text-[#0069ff]" />
          <p className="mt-3 text-sm font-extrabold text-[#11245a]">
            No matching staff
          </p>
          <p className="mt-1 text-xs font-semibold text-[#61709a]">
            Try a different name or email address.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden grid-cols-[2rem_minmax(10rem,1fr)_minmax(10rem,12rem)] items-center gap-3 border-b border-[#edf0f6] px-4 py-2 text-[11px] font-bold text-[#61709a] md:grid">
            <Checkbox
              checked={allVisibleSelected}
              onCheckedChange={(checked) => toggleVisible(Boolean(checked))}
            />
            <span>Team member</span>
            <span>Group</span>
          </div>

          <div className="divide-y divide-[#edf0f6]">
            {visibleEmployees.map((employee) => (
              <StaffTableRow
                key={employee.id}
                employee={employee}
                groups={groups}
                pending={pending}
                selected={selectedSet.has(employee.id)}
                onAssign={onAssign}
                onSelect={(checked) =>
                  setSelectedIds((current) =>
                    checked
                      ? Array.from(new Set([...current, employee.id]))
                      : current.filter((id) => id !== employee.id)
                  )
                }
              />
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-[#edf0f6] px-4 py-3 text-xs font-semibold text-[#61709a]">
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
    </div>
  )
}

export { StaffTable }
