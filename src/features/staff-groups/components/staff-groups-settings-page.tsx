"use client"

import * as React from "react"
import { Building2Icon, Layers3Icon, UsersIcon } from "lucide-react"

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { StaffGroupDialog } from "@/features/staff-groups/components/staff-group-dialog"
import { StaffGroupsSettingsList } from "@/features/staff-groups/components/staff-groups-settings-list"
import { getStaffGroupColorAppearance } from "@/features/staff-groups/constants/staff-group-colors"
import { useStaffGroupMutations } from "@/features/staff-groups/hooks/use-staff-group-mutations"
import { useStaffGroupSettingsQuery } from "@/features/staff-groups/hooks/use-staff-group-settings-query"
import {
  ResourceInfo,
  ResourceMetric,
  ResourcePageHeader,
  ResourceSearch,
} from "@/features/settings/components/resource-settings-page"

function StaffGroupsSettingsPage({
  organizationId,
  locationId,
  userId,
}: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const [search, setSearch] = React.useState("")
  const [color, setColor] = React.useState("all")
  const query = useStaffGroupSettingsQuery({
    organizationId,
    locationId,
    userId,
  })
  const mutations = useStaffGroupMutations({
    organizationId,
    locationId,
    userId,
  })

  if (query.isPending) return <GroupsState message="Loading groups..." />
  if (query.isError)
    return <GroupsState message="We could not load groups right now." />

  const groups = query.data.groups.filter(
    (group) =>
      (color === "all" || group.color === color) &&
      group.name.toLowerCase().includes(search.toLowerCase())
  )
  const isBusy =
    mutations.createMutation.isPending ||
    mutations.renameMutation.isPending ||
    mutations.setColorMutation.isPending ||
    mutations.deleteMutation.isPending

  return (
    <div className="space-y-5 text-[#11245a]">
      <ResourcePageHeader
        title="Groups"
        description="Organise staff on the rota with colour-coded groups."
        action={
          <StaffGroupDialog
            title="Create staff group"
            description="Add a new staff group for rota planning."
            triggerLabel="+ New group"
            submitLabel="Create group"
            pending={isBusy}
            onSubmit={async (values) => {
              await mutations.createMutation.mutateAsync(values)
            }}
          />
        }
      />

      <div className="hidden grid-cols-3 gap-3 md:grid">
        <ResourceMetric
          icon={Layers3Icon}
          label="Groups"
          value={query.data.groups.length}
        />
        <ResourceMetric
          icon={UsersIcon}
          label="Staff assigned"
          tone="green"
          value={
            query.data.employees.filter((employee) => employee.groupId).length
          }
        />
        <ResourceMetric
          icon={Building2Icon}
          label="Active staff"
          tone="purple"
          value={
            query.data.employees.filter(
              (employee) => employee.status === "active"
            ).length
          }
        />
      </div>

      <div className="flex gap-2">
        <ResourceSearch
          value={search}
          onChange={setSearch}
          placeholder="Search groups..."
        />
        <NativeSelect
          aria-label="Filter groups by colour"
          className="h-10 w-32 rounded-lg border-[#dfe5f0] bg-white text-xs sm:w-40"
          value={color}
          onChange={(event) => setColor(event.target.value)}
        >
          <NativeSelectOption value="all">All colours</NativeSelectOption>
          {Array.from(
            new Set(query.data.groups.map((group) => group.color))
          ).map((groupColor) => (
            <NativeSelectOption key={groupColor} value={groupColor}>
              {getStaffGroupColorAppearance(groupColor).label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <StaffGroupsSettingsList
        groups={groups}
        pending={isBusy}
        onRename={async (groupId, name) => {
          await mutations.renameMutation.mutateAsync({ groupId, name })
        }}
        onSetColor={async (groupId, nextColor) => {
          await mutations.setColorMutation.mutateAsync({
            groupId,
            color: nextColor,
          })
        }}
        onDelete={async (groupId) => {
          await mutations.deleteMutation.mutateAsync(groupId)
        }}
      />

      <ResourceInfo>
        Groups organise staff on the rota and provide visual identification
        only. They do not affect permissions or access.
      </ResourceInfo>
    </div>
  )
}

function GroupsState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-[#dfe5f0] bg-white p-6 text-center text-sm font-medium text-[#61709a]">
      {message}
    </div>
  )
}

export { StaffGroupsSettingsPage }
