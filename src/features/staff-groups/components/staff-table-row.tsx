"use client"

import { Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import type {
  StaffGroupSettingsEmployee,
  StaffGroupSettingsGroup,
} from "@/features/staff-groups/types"

function StaffTableRow({
  employee,
  groups,
  pending,
  selected,
  onAssign,
  onRemove,
  onSelect,
  onSetActive,
}: {
  employee: StaffGroupSettingsEmployee
  groups: StaffGroupSettingsGroup[]
  pending: boolean
  selected: boolean
  onAssign: (employeeId: string, groupId: string) => Promise<void>
  onRemove: () => void
  onSelect: (checked: boolean) => void
  onSetActive: (employeeId: string, isActive: boolean) => Promise<void>
}) {
  const isActive = employee.status === "active"

  return (
    <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_2rem] items-center gap-x-3 gap-y-3 px-2 py-3 md:grid-cols-[2rem_minmax(11rem,1fr)_minmax(9rem,11rem)_5rem_2.5rem]">
      <Checkbox
        checked={selected}
        onCheckedChange={(checked) => onSelect(Boolean(checked))}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{employee.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {employee.email ?? "No email yet"}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:text-destructive md:order-last"
        disabled={pending}
        onClick={onRemove}
      >
        <Trash2Icon className="size-3.5" />
        <span className="sr-only">Remove {employee.name}</span>
      </Button>
      <NativeSelect
        className="col-span-2 col-start-2 w-full md:col-span-1 md:col-start-auto"
        value={employee.groupId ?? ""}
        disabled={pending}
        aria-label={`Group for ${employee.name}`}
        onChange={(event) => {
          if (!event.target.value || event.target.value === employee.groupId)
            return
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
      <label className="col-span-2 col-start-2 flex items-center justify-between md:col-span-1 md:col-start-auto md:justify-center">
        <span className="text-xs text-muted-foreground md:hidden">Active</span>
        <Switch
          checked={isActive}
          disabled={pending}
          aria-label={`Set ${employee.name} active`}
          onCheckedChange={(checked) => {
            if (checked !== isActive) void onSetActive(employee.id, checked)
          }}
        />
      </label>
    </div>
  )
}

export { StaffTableRow }
