"use client"

import {
  Layers3Icon,
  LoaderCircleIcon,
  TriangleAlertIcon,
  UsersIcon,
} from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { getErrorMessage } from "@/lib/errors"
import { useStaffGroupMutations } from "@/features/staff-groups/hooks/use-staff-group-mutations"
import { useStaffGroupSettingsQuery } from "@/features/staff-groups/hooks/use-staff-group-settings-query"
import { StaffGroupListCard } from "@/features/staff-groups/components/staff-group-list-card"
import { StaffTable } from "@/features/staff-groups/components/staff-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function StaffGroupDashboardPage({
  organizationId,
  locationId,
  userId,
}: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const settingsQuery = useStaffGroupSettingsQuery({
    organizationId,
    locationId,
    userId,
  })
  const mutations = useStaffGroupMutations({
    organizationId,
    locationId,
    userId,
  })

  if (settingsQuery.isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
        <LoaderCircleIcon className="mr-2 size-4 animate-spin" />
        Loading team settings...
      </div>
    )
  }

  if (settingsQuery.isError) {
    return (
      <Empty className="border border-dashed border-border/70 bg-muted/10 py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlertIcon className="size-4" />
          </EmptyMedia>
          <EmptyTitle>We could not load team settings</EmptyTitle>
          <EmptyDescription>
            {getErrorMessage(
              settingsQuery.error,
              "We could not load your staff groups right now."
            )}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const isBusy =
    mutations.createMutation.isPending ||
    mutations.renameMutation.isPending ||
    mutations.setColorMutation.isPending ||
    mutations.deleteMutation.isPending ||
    mutations.assignMutation.isPending ||
    mutations.bulkAssignMutation.isPending ||
    mutations.setActiveMutation.isPending ||
    mutations.removeEmployeeMutation.isPending

  return (
    <Tabs defaultValue="staff" className="gap-6">
      <TabsList
        variant="line"
        className="h-auto w-full justify-start gap-5 border-b border-border/70 p-0"
      >
        <TabsTrigger value="staff" className="flex-none px-0 pb-3">
          <UsersIcon />
          Staff
          <span className="text-muted-foreground">
            {settingsQuery.data.employees.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="groups" className="flex-none px-0 pb-3">
          <Layers3Icon />
          Groups
          <span className="text-muted-foreground">
            {settingsQuery.data.groups.length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="staff">
        <StaffTable
          employees={settingsQuery.data.employees}
          groups={settingsQuery.data.groups}
          pending={isBusy}
          scopeLabel={organizationId ? "organisation" : "location"}
          onAssign={async (employeeId, groupId) => {
            await mutations.assignMutation.mutateAsync({ employeeId, groupId })
          }}
          onBulkAssign={async (employeeIds, groupId) => {
            await mutations.bulkAssignMutation.mutateAsync({
              employeeIds,
              groupId,
            })
          }}
          onSetActive={async (employeeId, isActive) => {
            await mutations.setActiveMutation.mutateAsync({
              employeeId,
              isActive,
            })
          }}
          onRemove={async (employeeId) => {
            await mutations.removeEmployeeMutation.mutateAsync(employeeId)
          }}
        />
      </TabsContent>

      <TabsContent value="groups">
        <StaffGroupListCard
          groups={settingsQuery.data.groups}
          isBusy={isBusy}
          onCreate={async (values) => {
            await mutations.createMutation.mutateAsync(values)
          }}
          onRename={async (groupId, name) => {
            await mutations.renameMutation.mutateAsync({ groupId, name })
          }}
          onSetColor={async (groupId, color) => {
            await mutations.setColorMutation.mutateAsync({ groupId, color })
          }}
          onDelete={async (groupId) => {
            await mutations.deleteMutation.mutateAsync(groupId)
          }}
        />
      </TabsContent>
    </Tabs>
  )
}

export { StaffGroupDashboardPage }
