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
    </div>
  )
}

export { MobileRotaCardActions }
