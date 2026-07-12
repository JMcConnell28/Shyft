"use client"

import { Link } from "@tanstack/react-router"
import { Layers3Icon, LoaderCircleIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StaffTable } from "@/features/staff-groups/components/staff-table"
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

  if (query.isPending)
    return (
      <TeamState icon={LoaderCircleIcon} message="Loading team settings..." />
    )
  if (query.isError)
    return (
      <TeamState
        icon={TriangleAlertIcon}
        message="We could not load team settings right now."
      />
    )

  const isBusy =
    mutations.assignMutation.isPending || mutations.bulkAssignMutation.isPending

  return (
    <div className="space-y-4 text-[#11245a]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">Team members</h2>
          <p className="mt-1 text-xs font-medium text-[#61709a]">
            Assign staff and manage their rota grouping.
          </p>
        </div>
        <Button
          render={
            <Link
              to="/w/$workspaceSlug/settings/team/groups"
              params={{ workspaceSlug }}
            />
          }
          variant="outline"
          size="lg"
          className="h-9 gap-2 rounded-lg px-3 text-[#0968f5]"
        >
          <Layers3Icon />
          Groups
        </Button>
      </div>
      <StaffTable
        employees={query.data.employees}
        groups={query.data.groups}
        pending={isBusy}
        onAssign={async (employeeId, groupId) => {
          await mutations.assignMutation.mutateAsync({ employeeId, groupId })
        }}
        onBulkAssign={async (employeeIds, groupId) => {
          await mutations.bulkAssignMutation.mutateAsync({
            employeeIds,
            groupId,
          })
        }}
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
    <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
      <Icon className="mr-2 size-4" />
      {message}
    </div>
  )
}

export { StaffGroupDashboardPage }
