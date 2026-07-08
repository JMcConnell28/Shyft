import { Link } from "@tanstack/react-router"
import {
  ArrowUpRightIcon,
  CalendarDaysIcon,
  Clock3Icon,
  MapPinIcon,
  MoreHorizontalIcon,
  PencilIcon,
  UsersRoundIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  rotaListActionButtonClassName,
  rotaListInteractiveSurfaceClassName,
} from "@/features/rota/constants/rota-list-styles"
import { cn } from "@/lib/utils"

type RotaListRowData = {
  id: string
  locationName: string
  locationSlug: string
  weekStart: string
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
  const opensPublishedView = row.status === "published"
  const canOpenRota = opensPublishedView || !canEdit
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
    <article
      className={cn(
        rotaListInteractiveSurfaceClassName,
        "p-4",
        row.isUnread && "border-blue-200"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {row.isUnread ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                <span className="size-2 rounded-full bg-blue-600" />
                Unread
              </span>
            ) : null}
            <StatusBadge row={row} />
          </div>

          <h2 className="mt-3 truncate text-lg leading-tight font-semibold tracking-[-0.02em] text-neutral-950">
            {row.weekLabel}
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="size-3.5 text-blue-600" />
              {row.locationName}
            </span>
            <span>Updated {row.updatedAt}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {canOpenRota ? (
            <Button
              size="sm"
              variant="base"
              className={rotaListActionButtonClassName}
              nativeButton={false}
              render={
                <Link
                  to={
                    opensPublishedView && workspaceType === "location"
                      ? "/w/$workspaceSlug/rota/$rotaId/view"
                      : opensPublishedView
                        ? "/w/$workspaceSlug/rota/$locationSlug/$rotaId/view"
                        : workspaceType === "location"
                          ? "/w/$workspaceSlug/rota/$rotaId"
                          : "/w/$workspaceSlug/rota/$locationSlug/$rotaId"
                  }
                  params={routeParams}
                />
              }
            >
              Open
              <ArrowUpRightIcon className="size-3.5" />
            </Button>
          ) : null}

          {canEdit ? (
            <Button
              size="sm"
              variant="base"
              className={rotaListActionButtonClassName}
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
              <PencilIcon className="size-3.5" />
              Edit
            </Button>
          ) : null}

          {canEdit ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    size="sm"
                    variant="base"
                    type="button"
                    className="h-8 w-9 text-neutral-900"
                  />
                }
              >
                <MoreHorizontalIcon className="size-4" />
                <span className="sr-only">Rota actions</span>
              </DropdownMenuTrigger>
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
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <MetricPill icon={CalendarDaysIcon}>{row.shiftCount} shifts</MetricPill>
        <MetricPill icon={UsersRoundIcon}>
          {row.scheduledStaffCount} staff
        </MetricPill>
        <MetricPill icon={Clock3Icon}>
          {row.scheduledHours.toFixed(1)}h
        </MetricPill>
      </div>

      <div className="mt-3 truncate text-xs font-medium text-neutral-500">
        {row.status === "published" && row.publishedBy ? (
          <span>Published by {row.publishedBy}</span>
        ) : (
          <span>Created by {row.createdBy}</span>
        )}
      </div>
    </article>
  )
}

function StatusBadge({ row }: { row: RotaListRowData }) {
  return (
    <>
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-[11px] font-semibold",
          row.status === "published"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-blue-50 text-blue-700"
        )}
      >
        {row.status === "published" ? "Published" : "Draft"}
      </span>
      {row.status === "published" && row.hasUnpublishedChanges ? (
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
          Changes not live
        </span>
      ) : null}
    </>
  )
}

function MetricPill({
  children,
  icon: Icon,
}: {
  children: React.ReactNode
  icon: typeof CalendarDaysIcon
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-600">
      <Icon className="size-3 text-blue-600" />
      {children}
    </span>
  )
}

export { RotaListRow }
