"use client"

import * as React from "react"
import { LoaderCircleIcon, TriangleAlertIcon } from "lucide-react"

import type { TeamStatusFilter } from "@/features/staff-groups/utils/team-settings"

import { StaffTable } from "@/features/staff-groups/components/staff-table"
import { TeamSettingsToolbar } from "@/features/staff-groups/components/team-settings-toolbar"
import { TeamSettingsSummary } from "@/features/staff-groups/components/team-settings-summary"
import { useStaffGroupMutations } from "@/features/staff-groups/hooks/use-staff-group-mutations"
import { useStaffGroupSettingsQuery } from "@/features/staff-groups/hooks/use-staff-group-settings-query"

function StaffGroupDashboardPage({
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
  const [selectedLocationId, setSelectedLocationId] = React.useState(
    locationId ?? ""
  )
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<TeamStatusFilter>("all")
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

  if (query.isPending) {
    return <TeamState icon={LoaderCircleIcon} message="Loading team settings..." />
  }

  if (query.isError) {
    return (
      <TeamState
        icon={TriangleAlertIcon}
        message="We could not load team settings right now."
      />
    )
  }

  if (!resolvedLocationId || query.data.locations.length === 0) {
    return (
      <TeamState
        icon={TriangleAlertIcon}
        message="Add a location before managing team groups."
      />
    )
  }

  return (
    <div className="space-y-4 text-[#10204b]">
      <TeamSettingsToolbar
        locations={query.data.locations}
        selectedLocationId={resolvedLocationId}
        search={search}
        status={status}
        workspaceSlug={workspaceSlug}
        onLocationChange={(nextLocationId) => {
          setSelectedLocationId(nextLocationId)
          setSearch("")
          setStatus("all")
        }}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      <StaffTable
        employees={query.data.employees}
        groups={query.data.groups}
        pending={query.isFetching || mutations.assignMutation.isPending}
        search={search}
        status={status}
        onAssign={async (employeeId, groupId) => {
          await mutations.assignMutation.mutateAsync({ employeeId, groupId })
        }}
      />

      <TeamSettingsSummary
        employees={query.data.employees}
        groups={query.data.groups}
      />
    </div>
  )
}

function TeamState({
  icon: Icon,
  message,
}: {
  icon: typeof LoaderCircleIcon
  message: string
}) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-xl border border-[#dfe5f0] bg-white text-sm text-[#61709a]">
      <Icon className="mr-2 size-4" />
      {message}
    </div>
  )
}

export { StaffGroupDashboardPage }
