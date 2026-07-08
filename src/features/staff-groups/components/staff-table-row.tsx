"use client"

import type {
  StaffGroupSettingsEmployee,
  StaffGroupSettingsGroup,
} from "@/features/staff-groups/types"
import { Checkbox } from "@/components/ui/checkbox"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

function StaffTableRow({
  employee,
  groups,
  pending,
  selected,
  onAssign,
  onSelect,
}: {
  employee: StaffGroupSettingsEmployee
  groups: Array<StaffGroupSettingsGroup>
  pending: boolean
  selected: boolean
  onAssign: (employeeId: string, groupId: string) => Promise<void>
  onSelect: (checked: boolean) => void
}) {
  const groupName =
    groups.find((group) => group.id === employee.groupId)?.name ?? "No group"

  return (
    <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-3 gap-y-3 px-4 py-3 md:grid-cols-[2rem_minmax(10rem,1fr)_minmax(10rem,12rem)]">
      <Checkbox
        checked={selected}
        onCheckedChange={(checked) => onSelect(Boolean(checked))}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold text-[#11245a]">
          {employee.name}
        </p>
        <p className="truncate text-xs font-semibold text-[#61709a]">
          {employee.email ?? "No email yet"} · {groupName}
        </p>
      </div>
      <NativeSelect
        className="col-span-2 col-start-2 h-9 w-full rounded-lg border-[#dfe5f0] bg-[#f8faff] text-xs font-bold md:col-span-1 md:col-start-auto"
        value={employee.groupId ?? ""}
        disabled={pending}
        aria-label={`Group for ${employee.name}`}
        onChange={(event) => {
          if (!event.target.value || event.target.value === employee.groupId) {
            return
          }

          void onAssign(employee.id, event.target.value)
        }}
      >
        {!employee.groupId ? (
          <NativeSelectOption value="">No group</NativeSelectOption>
        ) : null}
        {groups.map((group) => (
          <NativeSelectOption key={group.id} value={group.id}>
            {group.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  )
}

export { StaffTableRow }
