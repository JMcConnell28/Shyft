import { Link } from "@tanstack/react-router"
import { MapPinIcon, MoreHorizontalIcon, PencilIcon } from "lucide-react"

import type { RotaListItem } from "@/features/rota/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RotaListStatusBadge } from "@/features/rota/components/rota-list-status-badge"
import { rotaListInteractiveSurfaceClassName } from "@/features/rota/constants/rota-list-styles"
import { formatRotaUpdatedLabel } from "@/features/rota/utils/rota-list-format"
import { cn } from "@/lib/utils"

type RotaListRowProps = {
  canEdit: boolean
  orgSlug: string
  row: RotaListItem
  onDeleteDraft: (rotaId: string) => void
  onUnpublish: (rotaId: string) => void
  isDeletingDraft: boolean
  isUnpublishing: boolean
}

function RotaListRow({
  canEdit,
  orgSlug,
  row,
  onDeleteDraft,
  onUnpublish,
  isDeletingDraft,
  isUnpublishing,
}: RotaListRowProps) {
  const editRoute = "/app/$workspaceSlug/rota/$locationSlug/$rotaId"
  const openRoute =
    row.status === "published"
      ? "/app/$workspaceSlug/rota/$locationSlug/$rotaId/view"
      : editRoute
  const routeParams = {
    workspaceSlug: orgSlug,
    locationSlug: row.locationSlug,
    rotaId: row.id,
  }

  return (
    <article
      className={cn(
        rotaListInteractiveSurfaceClassName,
        "flex flex-col gap-4 p-4 text-[#10285c] lg:flex-row lg:items-center lg:justify-between",
        row.isUnread && "border-[#a9c8ff]"
      )}
    >
      <div className="min-w-0">
        <p className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-[#0868f7]">
          <MapPinIcon className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{row.locationName}</span>
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-2.5">
          <h2 className="text-[17px] leading-6 font-semibold tracking-[-0.02em]">
            {row.weekLabel}
          </h2>
          <RotaListStatusBadge status={row.status} />
          {row.isUnread ? (
            <span className="text-[11px] font-semibold text-[#0868f7]">
              New
            </span>
          ) : null}
          {row.hasUnpublishedChanges ? (
            <span className="text-[11px] font-semibold text-[#c77b00]">
              Changes not live
            </span>
          ) : null}
        </div>

        <p className="mt-0.5 text-xs font-medium text-[#526991]">
          {row.status === "published" ? (
            <>
              Published{row.publishedBy ? " by " : null}
              {row.publishedBy ? (
                <span className="font-semibold text-[#0868f7]">
                  {row.publishedBy}
                </span>
              ) : null}
            </>
          ) : (
            "Draft"
          )}
        </p>

        <p className="mt-2 text-[11px] font-medium text-[#607399]">
          {formatRotaUpdatedLabel(row)}
          <span className="px-1.5" aria-hidden="true">
            •
          </span>
          {row.shiftCount} shifts
          <span className="px-1.5" aria-hidden="true">
            •
          </span>
          {row.scheduledStaffCount} staff
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="secondary"
          nativeButton={false}
          render={<Link to={openRoute} params={routeParams} />}
        >
          Open
        </Button>

        {canEdit ? (
          <Button
            variant="primary"
            nativeButton={false}
            render={<Link to={editRoute} params={routeParams} />}
          >
            <PencilIcon className="size-3.5" />
            Edit
          </Button>
        ) : null}

        {canEdit ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button size="icon" variant="secondary" type="button" />}
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
    </article>
  )
}

export { RotaListRow }
