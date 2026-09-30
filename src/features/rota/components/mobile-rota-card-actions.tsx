import { Link } from "@tanstack/react-router"
import { PencilIcon } from "lucide-react"

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
  const routeParams = {
    workspaceSlug: data.orgSlug,
    locationSlug: row.locationSlug,
    rotaId: row.id,
  }
  const editRoute = "/app/$workspaceSlug/rota/$locationSlug/$rotaId"
  const openRoute =
    row.status === "published"
      ? "/app/$workspaceSlug/rota/$locationSlug/$rotaId/view"
      : editRoute

  return (
    <div className="flex items-center justify-end gap-1.5">
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
  )
}

export { MobileRotaCardActions }
