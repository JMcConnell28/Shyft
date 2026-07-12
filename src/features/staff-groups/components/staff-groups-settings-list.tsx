import type { StaffGroupSettingsGroup } from "@/features/staff-groups/types"
import { DeleteStaffGroupDialog } from "@/features/staff-groups/components/delete-staff-group-dialog"
import { StaffGroupDialog } from "@/features/staff-groups/components/staff-group-dialog"
import { getStaffGroupColorAppearance } from "@/features/staff-groups/constants/staff-group-colors"

type GroupListProps = {
  groups: Array<StaffGroupSettingsGroup>
  pending: boolean
  onRename: (id: string, name: string) => Promise<void>
  onSetColor: (
    id: string,
    color: StaffGroupSettingsGroup["color"]
  ) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function StaffGroupsSettingsList(props: GroupListProps) {
  if (props.groups.length === 0)
    return (
      <div className="rounded-xl border border-[#dfe5f0] bg-white p-6 text-center text-sm font-medium text-[#61709a]">
        No groups match your search.
      </div>
    )

  return (
    <section className="overflow-hidden rounded-xl border border-[#dfe5f0] bg-white shadow-[0_8px_24px_rgba(30,50,96,0.045)]">
      <div className="hidden grid-cols-[minmax(0,1fr)_0.55fr_0.8fr_0.5fr_auto] gap-4 border-b border-[#dfe5f0] px-5 py-3 text-[11px] font-semibold tracking-wide text-[#61709a] uppercase md:grid">
        <span>Group</span>
        <span>Staff</span>
        <span>Used in</span>
        <span>Preview</span>
        <span>Actions</span>
      </div>
      <div className="divide-y divide-[#e7ebf3]">
        {props.groups.map((group) => (
          <GroupRow key={group.id} group={group} {...props} />
        ))}
      </div>
    </section>
  )
}

function GroupRow({
  group,
  pending,
  onRename,
  onSetColor,
  onDelete,
}: Omit<GroupListProps, "groups"> & { group: StaffGroupSettingsGroup }) {
  const appearance = getStaffGroupColorAppearance(group.color)
  return (
    <div
      className={`grid gap-3 border-l-4 px-4 py-4 md:grid-cols-[minmax(0,1fr)_0.55fr_0.8fr_0.5fr_auto] md:items-center md:border-l-0 md:px-5 ${appearance.cardClassName}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`size-3 shrink-0 rounded-full ${appearance.swatchClassName}`}
        />
        <strong className="truncate text-sm">{group.name}</strong>
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-[#61709a] md:contents">
        <span>{group.employeeCount} staff</span>
        <span aria-hidden="true" className="md:hidden">
          •
        </span>
        <span>{group.isFallback ? "Default group" : "This workspace"}</span>
      </div>
      <span
        className={`hidden w-fit rounded-lg border px-2 py-1 text-[11px] font-semibold md:block ${appearance.badgeClassName}`}
      >
        {appearance.label}
      </span>
      <div className="flex justify-end gap-2">
        {!group.isFallback ? (
          <StaffGroupDialog
            title="Edit staff group"
            description="Update the group name and colour."
            triggerLabel="Edit"
            defaultName={group.name}
            defaultColor={group.color}
            submitLabel="Save changes"
            pending={pending}
            onSubmit={async ({ name, color }) => {
              if (name !== group.name) await onRename(group.id, name)
              if (color !== group.color) await onSetColor(group.id, color)
            }}
          />
        ) : (
          <span className="text-xs font-medium text-[#61709a]">Default</span>
        )}
        {!group.isFallback ? (
          <DeleteStaffGroupDialog
            group={group}
            pending={pending}
            onConfirm={() => onDelete(group.id)}
          />
        ) : null}
      </div>
    </div>
  )
}

export { StaffGroupsSettingsList }
