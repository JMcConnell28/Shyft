import { Link } from "@tanstack/react-router"
import {
  ArrowUpRightIcon,
  DotIcon,
  PencilIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getStatusVariant } from "@/features/rota/utils/formatting"

type RotaListRowData = {
  id: string
  locationName: string
  locationSlug: string
  weekLabel: string
  status: "draft" | "published"
  createdBy: string
  publishedBy: string | null
  updatedAt: string
  scheduledHours: number
  scheduledStaffCount: number
  shiftCount: number
  zoneCount: number
  note: string | null
  isUnread: boolean
  hasUnpublishedChanges: boolean
}

function RotaListRow({
  canEdit,
  orgSlug,
  workspaceType = "organization",
  locationWorkspaceSlug,
  row,
  onDeleteDraft,
  onUnpublish,
  isDeletingDraft,
  isUnpublishing,
}: {
  canEdit: boolean
  orgSlug: string
  workspaceType?: "organization" | "location"
  locationWorkspaceSlug?: string
  row: RotaListRowData
  onDeleteDraft: (rotaId: string) => void
  onUnpublish: (rotaId: string) => void
  isDeletingDraft: boolean
  isUnpublishing: boolean
}) {
  const canOpenPublishedView = row.status === "published"
  const routeParams =
    workspaceType === "location"
      ? {
          workspaceSlug: locationWorkspaceSlug ?? row.locationSlug,
          rotaId: row.id,
        }
      : {
          workspaceSlug: orgSlug,
          locationSlug: row.locationSlug,
          rotaId: row.id,
        }

  return (
    <article className="grid gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-muted/10 md:grid-cols-[minmax(13rem,1.35fr)_minmax(7rem,0.75fr)_7rem_5rem_minmax(8rem,0.85fr)_8rem] md:items-center sm:px-5">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          {row.isUnread ? (
            <span className="inline-flex shrink-0 items-center text-rose-500">
              <DotIcon className="-mx-1 size-6" />
            </span>
          ) : null}
          <h2 className="truncate text-sm font-semibold tracking-tight">
            {row.weekLabel}
          </h2>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Updated {row.updatedAt}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 md:contents">
        <div className="min-w-0 md:p-0">
          <span className="mr-1 text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase md:hidden">
            Created by
          </span>
          <span className="truncate text-xs text-foreground md:block md:text-sm">
            {row.createdBy}
          </span>
        </div>

        <div className="min-w-0 md:p-0">
          <span className="mr-1 text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase md:hidden">
            Status
          </span>
          <div className="inline-flex flex-wrap items-center gap-1.5 align-middle md:flex">
            <Badge variant={getStatusVariant(row.status)}>
              {row.status === "published" ? "Published" : "Draft"}
            </Badge>
            {row.status === "published" && row.hasUnpublishedChanges ? (
              <Badge
                variant="outline"
                className="border-amber-200/80 bg-amber-50 text-amber-700"
              >
                Changes not live
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 md:p-0">
          <span className="mr-1 text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase md:hidden">
            Shifts
          </span>
          <span className="text-xs text-foreground md:block md:text-sm">
            {row.shiftCount}
          </span>
        </div>

        <div className="min-w-0 md:p-0">
          <span className="mr-1 text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase md:hidden">
            Location
          </span>
          <span className="truncate text-xs text-foreground md:block md:text-sm">
            {row.locationName}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
        {canOpenPublishedView ? (
          <Button
            size="sm"
            variant="pill"
            className="gap-2"
            nativeButton={false}
            render={
              <Link
                to={
                  workspaceType === "location"
                    ? "/w/$workspaceSlug/rota/$rotaId/view"
                    : "/w/$workspaceSlug/rota/$locationSlug/$rotaId/view"
                }
                params={routeParams}
              />
            }
          >
            Open
            <ArrowUpRightIcon className="hidden size-3.5 sm:block" />
          </Button>
        ) : null}
        {canEdit ? (
          <Button
            size="sm"
            variant="pill"
            className="gap-2"
            nativeButton={false}
            render={
              <Link
                to={
                  workspaceType === "location"
                    ? "/w/$workspaceSlug/rota/$rotaId"
                    : "/w/$workspaceSlug/rota/$locationSlug/$rotaId"
                }
                params={routeParams}
              />
            }
          >
            <span className="sr-only sm:not-sr-only">Edit</span>
            <PencilIcon className="size-3.5" />
          </Button>
        ) : null}
        {canEdit ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="sm" variant="pill" type="button">
                  <MoreHorizontalIcon className="size-3.5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              {row.status === "published" ? (
                <DropdownMenuItem
                  disabled={isUnpublishing}
                  onClick={() => onUnpublish(row.id)}
                >
                  {isUnpublishing ? "Unpublishing..." : "Unpublish rota"}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={isDeletingDraft}
                  onClick={() => onDeleteDraft(row.id)}
                >
                  {isDeletingDraft ? "Deleting..." : "Delete draft"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </article>
  )
}

export { RotaListRow }
