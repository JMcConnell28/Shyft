import { Link } from "@tanstack/react-router"
import {
  CalendarDaysIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlayCircleIcon,
} from "lucide-react"

import type { RotaListItem, RotaListPageData } from "@/features/rota/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  rotaListActionButtonClassName,
  rotaListPrimaryButtonClassName,
} from "@/features/rota/constants/rota-list-styles"

type MobileRotaCardActionsProps = {
  canEdit: boolean
  data: RotaListPageData
  isCurrent: boolean
  isDeletingDraft: boolean
  isUnpublishing: boolean
  onDeleteDraft: (rotaId: string, weekLabel: string) => void
  onUnpublish: (rotaId: string, weekLabel: string) => void
  row: RotaListItem
}

function MobileRotaCardActions({
  canEdit,
  data,
  isCurrent,
  isDeletingDraft,
  isUnpublishing,
  onDeleteDraft,
  onUnpublish,
  row,
}: MobileRotaCardActionsProps) {
  const routeParams =
    data.workspaceType === "location"
      ? {
          workspaceSlug: data.locationWorkspaceSlug ?? row.locationSlug,
          rotaId: row.id,
        }
      : {
          workspaceSlug: data.orgSlug,
          locationSlug: row.locationSlug,
          rotaId: row.id,
        }

  return (
    <>
      <div className="mt-3 flex items-center gap-2 border-t border-neutral-200 pt-3">
        <Button
          size="sm"
          variant="base"
          className={`${rotaListActionButtonClassName} h-9 flex-1`}
          nativeButton={false}
          render={
            <Link
              to={
                row.status === "published"
                  ? data.workspaceType === "location"
                    ? "/w/$workspaceSlug/rota/$rotaId/view"
                    : "/w/$workspaceSlug/rota/$locationSlug/$rotaId/view"
                  : data.workspaceType === "location"
                    ? "/w/$workspaceSlug/rota/$rotaId"
                    : "/w/$workspaceSlug/rota/$locationSlug/$rotaId"
              }
              params={routeParams}
            />
          }
        >
          <CalendarDaysIcon className="size-3.5" />
          Open
        </Button>

        {canEdit ? (
          <Button
            size="sm"
            variant="base"
            className={`${rotaListActionButtonClassName} h-9 flex-1`}
            nativeButton={false}
            render={
              <Link
                to={
                  data.workspaceType === "location"
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
        ) : (
          <span className="flex-1" />
        )}

        {canEdit ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="sm"
                  variant="base"
                  type="button"
                  className="h-9 w-11 text-neutral-900"
                />
              }
            >
              <MoreHorizontalIcon className="size-4.5" />
              <span className="sr-only">Rota actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {row.status === "published" ? (
                <DropdownMenuItem
                  disabled={isUnpublishing}
                  onClick={() => onUnpublish(row.id, row.weekLabel)}
                >
                  {isUnpublishing ? "Unpublishing..." : "Unpublish rota"}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={isDeletingDraft}
                  onClick={() => onDeleteDraft(row.id, row.weekLabel)}
                >
                  {isDeletingDraft ? "Deleting..." : "Delete draft"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {isCurrent && canEdit && row.status === "draft" ? (
        <Button
          size="sm"
          variant="base"
          className={`${rotaListPrimaryButtonClassName} mt-2.5 h-10 w-full text-sm`}
          nativeButton={false}
          render={
            <Link
              to={
                data.workspaceType === "location"
                  ? "/w/$workspaceSlug/rota/$rotaId"
                  : "/w/$workspaceSlug/rota/$locationSlug/$rotaId"
              }
              params={routeParams}
            />
          }
        >
          <PlayCircleIcon className="size-5" />
          Resume
        </Button>
      ) : null}
    </>
  )
}

export { MobileRotaCardActions }
