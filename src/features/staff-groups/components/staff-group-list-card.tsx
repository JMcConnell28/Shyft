"use client"

import { StarIcon } from "lucide-react"

import {
  getStaffGroupColorAppearance,
  type StaffGroupColor,
} from "@/features/staff-groups/constants/staff-group-colors"
import type { StaffGroupSettingsGroup } from "@/features/staff-groups/types"
import { DeleteStaffGroupDialog } from "@/features/staff-groups/components/delete-staff-group-dialog"
import { StaffGroupDialog } from "@/features/staff-groups/components/staff-group-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function StaffGroupListCard({
  groups,
  isBusy = false,
  onCreate,
  onRename,
  onSetColor,
  onDelete,
}: {
  groups: Array<StaffGroupSettingsGroup>
  isBusy?: boolean
  onCreate: (values: { name: string; color: StaffGroupColor }) => Promise<void>
  onRename: (groupId: string, name: string) => Promise<void>
  onSetColor: (groupId: string, color: StaffGroupColor) => Promise<void>
  onDelete: (groupId: string) => Promise<void>
}) {
  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm">Staff groups</CardTitle>
          <p className="text-xs text-muted-foreground">
            Organize team members for invites and rota grouping.
          </p>
        </div>
        <StaffGroupDialog
          title="Create staff group"
          description="Add a new organization-wide staff group."
          triggerLabel="New group"
          submitLabel="Create group"
          pending={isBusy}
          onSubmit={onCreate}
        />
      </CardHeader>
      <CardContent className="divide-y divide-border/70 py-0!">
        {groups.map((group) => (
          <div key={group.id} className="flex min-h-18 flex-col gap-3 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`size-2.5 rounded-full ${getStaffGroupColorAppearance(group.color).swatchClassName}`}
                />
                <span className="text-sm font-medium text-foreground">
                  {group.name}
                </span>
                {group.isFallback ? (
                  <Badge variant="outline" className="gap-1">
                    <StarIcon className="size-3" />
                    Fallback
                  </Badge>
                ) : null}
              </div>
              <span className="text-xs text-muted-foreground">
                {group.employeeCount} member
                {group.employeeCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!group.isFallback ? (
                <StaffGroupDialog
                  title="Edit staff group"
                  description="Update the staff group name and color for future invites and rota grouping."
                  triggerLabel="Edit"
                  defaultName={group.name}
                  defaultColor={group.color}
                  submitLabel="Save changes"
                  pending={isBusy}
                  onSubmit={async ({ name, color }) => {
                    if (name !== group.name) {
                      await onRename(group.id, name)
                    }

                    if (color !== group.color) {
                      await onSetColor(group.id, color)
                    }
                  }}
                />
              ) : null}
              {!group.isFallback ? (
                <DeleteStaffGroupDialog
                  group={group}
                  pending={isBusy}
                  onConfirm={() => onDelete(group.id)}
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  Used when someone does not belong to a specific rota group
                  yet.
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export { StaffGroupListCard }
