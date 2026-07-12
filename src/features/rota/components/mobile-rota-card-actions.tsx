import { Link } from "@tanstack/react-router"
import { ChevronRightIcon, PencilIcon } from "lucide-react"

import type { RotaListItem, RotaListPageData } from "@/features/rota/types"
import { Button } from "@/components/ui/button"

type MobileRotaCardActionsProps = {
  canEdit: boolean
  data: RotaListPageData
  row: RotaListItem
}

function MobileRotaCardActions({
  canEdit,
  data,
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
  const editRoute =
    data.workspaceType === "location"
      ? "/w/$workspaceSlug/rota/$rotaId"
      : "/w/$workspaceSlug/rota/$locationSlug/$rotaId"
  const openRoute =
    row.status === "published"
      ? data.workspaceType === "location"
        ? "/w/$workspaceSlug/rota/$rotaId/view"
        : "/w/$workspaceSlug/rota/$locationSlug/$rotaId/view"
      : editRoute

  return (
    <>
      <Link
        to={openRoute}
        params={routeParams}
        className="absolute top-3 right-2.5 flex size-7 items-center justify-center rounded-full text-[#405782] transition-colors hover:bg-[#f3f6fb] hover:text-[#0868f7]"
        aria-label={`Open ${row.weekLabel}`}
      >
        <ChevronRightIcon className="size-[18px]" />
      </Link>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link to={openRoute} params={routeParams} />}
          className="h-8 rounded-lg border-[#d8e2f0] bg-white px-2.5 text-xs font-semibold text-[#0765e8] shadow-none"
        >
          Open
        </Button>
        {canEdit ? (
          <Button
            nativeButton={false}
            render={<Link to={editRoute} params={routeParams} />}
            className={
              row.status === "draft"
                ? "h-8 gap-1.5 rounded-lg bg-[#0868f7] px-2.5 text-xs font-semibold text-white shadow-none hover:bg-[#005de2]"
                : "h-8 gap-1.5 rounded-lg bg-[#edf3ff] px-2.5 text-xs font-semibold text-[#0765e8] shadow-none hover:bg-[#e4edff]"
            }
          >
            <PencilIcon className="size-3.5" />
            Edit
          </Button>
        ) : null}
      </div>
    </>
  )
}

export { MobileRotaCardActions }
