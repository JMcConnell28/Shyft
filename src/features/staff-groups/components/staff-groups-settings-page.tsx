"use client"

import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeftIcon,
  Building2Icon,
  Layers3Icon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react"

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
  workspaceSlug,
}: {
  organizationId?: string
  locationId?: string
  userId: string
  workspaceSlug: string
}) {
  const [search, setSearch] = React.useState("")
  const [color, setColor] = React.useState("all")
  const [selectedLocationId, setSelectedLocationId] = React.useState(
    locationId ?? ""
  )
  const query = useStaffGroupSettingsQuery({
    organizationId,
    locationId,
    selectedLocationId: selectedLocationId || undefined,
    userId,
  })
  const resolvedLocationId =
    selectedLocationId || query.data?.selectedLocationId || ""
  const mutations = useStaffGroupMutations({
    organizationId,
    locationId,
    selectedLocationId: resolvedLocationId || undefined,
    userId,
  })

  React.useEffect(() => {
    if (!selectedLocationId && query.data?.selectedLocationId) {
      setSelectedLocationId(query.data.selectedLocationId)
    }
  }, [query.data?.selectedLocationId, selectedLocationId])

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
      <Link
        to="/app/$workspaceSlug/settings/team"
        params={{ workspaceSlug }}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#61709a] transition-colors hover:text-[#0968f5]"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to team
      </Link>
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

      <div className="grid gap-2 sm:grid-cols-[minmax(12rem,auto)_1fr_auto]">
        <div className="relative">
          <MapPinIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[#60709a]" />
          <NativeSelect
            aria-label="Group location"
            className="w-full [&_select]:h-10 [&_select]:rounded-lg [&_select]:border-[#dfe5f0] [&_select]:bg-white [&_select]:pr-8 [&_select]:pl-9 [&_select]:text-xs [&_select]:font-semibold"
            value={resolvedLocationId}
            onChange={(event) => setSelectedLocationId(event.target.value)}
          >
            {query.data.locations.map((location) => (
              <NativeSelectOption key={location.id} value={location.id}>
                {location.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <ResourceSearch
          value={search}
          onChange={setSearch}
          placeholder="Search groups..."
        />
        <NativeSelect
          aria-label="Filter groups by colour"
          className="h-10 w-full rounded-lg border-[#dfe5f0] bg-white text-xs sm:w-40"
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
        Groups are shared across your workspace. Staff counts reflect the
        selected location, and colours appear throughout rota planning.
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
