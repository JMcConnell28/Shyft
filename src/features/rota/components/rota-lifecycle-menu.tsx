"use client"

import * as React from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { ArchiveXIcon, Settings, TriangleAlertIcon } from "lucide-react"

import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { rotaToolbarIconButtonClassName } from "@/features/rota/constants/rota-toolbar-styles"
import { useDeleteDraftRota } from "@/features/rota/hooks/use-delete-draft-rota"
import { useUnpublishRota } from "@/features/rota/hooks/use-unpublish-rota"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function RotaLifecycleMenu() {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const { meta } = useRotaWorkspace()
  const deleteDraftMutation = useDeleteDraftRota()
  const unpublishMutation = useUnpublishRota()
  const [pendingAction, setPendingAction] = React.useState<
    "delete-draft" | "unpublish" | null
  >(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="pill"
              size="icon"
              className={rotaToolbarIconButtonClassName}
            >
              <Settings data-icon="inline-start" />
              <span className="hidden group-data-[toolbar-more=true]/toolbar-more:inline">
                Rota settings
              </span>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          {meta.status === "published" ? (
            <DropdownMenuItem
              className="text-amber-700 focus:text-amber-700"
              disabled={unpublishMutation.isPending}
              onClick={() => setPendingAction("unpublish")}
            >
              <ArchiveXIcon className="size-4" />
              {unpublishMutation.isPending
                ? "Unpublishing..."
                : "Unpublish rota"}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={deleteDraftMutation.isPending}
              onClick={() => setPendingAction("delete-draft")}
            >
              {deleteDraftMutation.isPending ? "Deleting..." : "Delete draft"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <TriangleAlertIcon className="size-4" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {pendingAction === "unpublish"
                ? "Unpublish this rota?"
                : "Delete this draft rota?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === "unpublish"
                ? "This will remove the rota from the employee view and return it to draft status."
                : "This draft will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={
                deleteDraftMutation.isPending || unpublishMutation.isPending
              }
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={
                deleteDraftMutation.isPending || unpublishMutation.isPending
              }
              onClick={() => {
                if (pendingAction === "unpublish") {
                  void unpublishMutation
                    .mutateAsync({ rotaId: meta.rotaId })
                    .finally(() => setPendingAction(null))
                  return
                }

                void deleteDraftMutation
                  .mutateAsync({ rotaId: meta.rotaId })
                  .then(async () => {
                    if (!params.workspaceSlug) {
                      return
                    }

                    await navigate({
                      to: "/w/$workspaceSlug/rota",
                      params: {
                        workspaceSlug: String(params.workspaceSlug),
                      },
                      search: {
                        status: "all",
                        range: "all",
                        page: 1,
                        pageSize: 20,
                      },
                    })
                  })
                  .finally(() => setPendingAction(null))
              }}
            >
              {pendingAction === "unpublish"
                ? unpublishMutation.isPending
                  ? "Unpublishing..."
                  : "Unpublish"
                : deleteDraftMutation.isPending
                  ? "Deleting..."
                  : "Delete draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default RotaLifecycleMenu
