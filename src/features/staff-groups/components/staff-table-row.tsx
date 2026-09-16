"use client"

import type {
  StaffGroupSettingsEmployee,
  StaffGroupSettingsGroup,
} from "@/features/staff-groups/types"

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { getStaffGroupColorAppearance } from "@/features/staff-groups/constants/staff-group-colors"

function StaffTableRow({
  employee,
  groups,
  pending,
  onAssign,
}: {
  employee: StaffGroupSettingsEmployee
  groups: Array<StaffGroupSettingsGroup>
  pending: boolean
  onAssign: (employeeId: string, groupId: string) => Promise<void>
}) {
  const group = groups.find((entry) => entry.id === employee.groupId) ?? null

  return (
    <>
      <article className="rounded-xl border border-[#dfe5f0] bg-white p-3 shadow-[0_3px_12px_rgba(30,50,96,0.035)] md:hidden">
        <div className="flex min-w-0 items-start gap-3">
          <EmployeeAvatar employee={employee} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-bold text-[#10204b]">
                {employee.name}
              </h3>
              <StatusDot status={employee.status} />
            </div>
            <p className="mt-0.5 truncate text-xs text-[#61709a]">
              {getRoleLabel(employee.role)}
            </p>
            <div className="mt-2.5">
              <GroupSelect
                employee={employee}
                group={group}
                groups={groups}
                pending={pending}
                onAssign={onAssign}
              />
            </div>
          </div>
        </div>
      </article>

      <div className="hidden min-h-16 grid-cols-[minmax(13rem,1.35fr)_minmax(8rem,.7fr)_minmax(10rem,.9fr)_6rem_minmax(12rem,1fr)] items-center gap-4 border-b border-[#e8ecf4] px-4 py-3 last:border-b-0 md:grid">
        <div className="flex min-w-0 items-center gap-3">
          <EmployeeAvatar employee={employee} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#10204b]">
              {employee.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-[#61709a]">
              {employee.email ?? "No email address"}
            </p>
          </div>
        </div>
        <p className="truncate text-xs font-medium text-[#42527a]">
          {getRoleLabel(employee.role)}
        </p>
        <GroupSelect
          employee={employee}
          group={group}
          groups={groups}
          pending={pending}
          onAssign={onAssign}
        />
        <span
          className={`w-fit rounded-md px-2 py-1 text-[11px] font-semibold ${
            employee.status === "active"
              ? "bg-[#eaf8ec] text-[#15963d]"
              : "bg-[#f1f3f7] text-[#6f7a98]"
          }`}
        >
          {employee.status === "active" ? "Active" : "Inactive"}
        </span>
        <p className="truncate text-xs text-[#61709a]">
          {employee.email ?? "No contact email"}
        </p>
      </div>
    </>
  )
}

function EmployeeAvatar({ employee }: { employee: StaffGroupSettingsEmployee }) {
  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef3fb] text-xs font-bold text-[#1f58b3]">
      {getInitials(employee.name)}
      <span
        className={`absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white ${
          employee.status === "active" ? "bg-[#16a34a]" : "bg-[#aeb6c8]"
        }`}
      />
    </span>
  )
}

function GroupSelect({
  employee,
  group,
  groups,
  pending,
  onAssign,
}: {
  employee: StaffGroupSettingsEmployee
  group: StaffGroupSettingsGroup | null
  groups: Array<StaffGroupSettingsGroup>
  pending: boolean
  onAssign: (employeeId: string, groupId: string) => Promise<void>
}) {
  const swatchClassName = group
    ? getStaffGroupColorAppearance(group.color).swatchClassName
    : "bg-[#aeb6c8]"

  return (
    <div className="relative min-w-0">
      <span
        className={`pointer-events-none absolute top-1/2 left-3 z-10 size-2 -translate-y-1/2 rounded-full ${swatchClassName}`}
      />
      <NativeSelect
        className="w-full [&_select]:h-9 [&_select]:rounded-lg [&_select]:border-[#dfe5f0] [&_select]:bg-white [&_select]:pr-8 [&_select]:pl-7 [&_select]:text-xs [&_select]:font-medium"
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
          <NativeSelectOption value="">Choose group</NativeSelectOption>
        ) : null}
        {groups.map((entry) => (
          <NativeSelectOption key={entry.id} value={entry.id}>
            {entry.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  )
}

function StatusDot({ status }: { status: StaffGroupSettingsEmployee["status"] }) {
  return (
    <span
      className={`size-2 shrink-0 rounded-full ${
        status === "active" ? "bg-[#16a34a]" : "bg-[#aeb6c8]"
      }`}
      aria-label={status === "active" ? "Active" : "Inactive"}
    />
  )
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function getRoleLabel(role: string | null) {
  if (!role) return "Team member"
  const primaryRole = role.split(",").at(0)?.trim() ?? role
  return primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1)
}

export { StaffTableRow }
