"use client"

import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowUpRightIcon,
  CalendarRangeIcon,
  DotIcon,
  MapPinIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { NewRotaDialog } from "@/components/app/new-rota-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { RotaListFilters } from "@/features/rota/components/rota-list-filters"
import { RotaListRow } from "@/features/rota/components/rota-list-row"
import { useDeleteDraftRota } from "@/features/rota/hooks/use-delete-draft-rota"
import { useUnpublishRota } from "@/features/rota/hooks/use-unpublish-rota"
import type {
  RotaPageSize,
  RotaRangeFilter,
  RotaStatusFilter,
} from "@/features/rota/schemas/rota-schemas"
import type { RotaListPageData } from "@/features/rota/types"
import { rotaPageSizeValues } from "@/lib/rota-schemas"

type RotaListPageProps = {
  data: RotaListPageData
  onLocationChange: (locationSlug: string) => void
  onStatusChange: (status: RotaStatusFilter) => void
  onRangeChange: (range: RotaRangeFilter) => void
  onCustomRangeChange: (value: { from?: string; to?: string }) => void
  onPageSizeChange: (pageSize: RotaPageSize) => void
  onPageChange: (page: number) => void
}

function RotaListPage({
  data,
  onLocationChange,
  onStatusChange,
  onRangeChange,
  onCustomRangeChange,
  onPageSizeChange,
  onPageChange,
}: RotaListPageProps) {
  const deleteDraftMutation = useDeleteDraftRota()
  const unpublishMutation = useUnpublishRota()
  const canEditRotas = data.capabilities.canManageRota
  const canCreateRota =
    data.capabilities.canCreateRota && Boolean(data.selectedLocation)
  const [pendingLifecycleAction, setPendingLifecycleAction] = React.useState<{
    rotaId: string
    type: "delete-draft" | "unpublish"
    weekLabel: string
  } | null>(null)
  const compactOverview = [
    `${data.pagination.totalItems} rotas`,
    canEditRotas ? `${data.overview.draftRotas} drafts` : null,
    `${data.overview.publishedRotas} published`,
    data.overview.unreadPublishedRotas > 0
      ? `${data.overview.unreadPublishedRotas} unread`
      : null,
  ].filter(Boolean) as Array<string>
  const firstVisibleItem =
    data.pagination.totalItems === 0
      ? 0
      : (data.pagination.page - 1) * data.pagination.pageSize + 1
  const lastVisibleItem = Math.min(
    data.pagination.page * data.pagination.pageSize,
    data.pagination.totalItems
  )

  return (
    <div className="flex flex-1 flex-col overflow-x-hidden">
      <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <h2 className="text-md font-semibold tracking-tight">Rotas</h2>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {data.selectedLocation?.name ?? "No location selected"}
              </span>
              {compactOverview.map((item) => (
                <span key={item} className="inline-flex items-center gap-1">
                  <DotIcon className="-mx-1 size-4 text-muted-foreground/70" />
                  {item}
                </span>
              ))}
            </div>

            {data.latestDraft && canEditRotas ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Latest draft</span>
                <span className="font-medium text-foreground">
                  {data.latestDraft.weekLabel}
                </span>
                <span>Updated {data.latestDraft.updatedAt}</span>
                <Button
                  size="sm"
                  variant="pill"
                  nativeButton={false}
                  render={
                    <Link
                      to={
                        data.workspaceType === "location"
                          ? "/w/$workspaceSlug/rota/$rotaId"
                          : "/w/$workspaceSlug/rota/$locationSlug/$rotaId"
                      }
                      params={
                        data.workspaceType === "location"
                          ? {
                              workspaceSlug:
                                data.locationWorkspaceSlug ??
                                data.latestDraft.locationSlug,
                              rotaId: data.latestDraft.id,
                            }
                          : {
                              workspaceSlug: data.orgSlug,
                              locationSlug: data.latestDraft.locationSlug,
                              rotaId: data.latestDraft.id,
                            }
                      }
                    />
                  }
                  className="gap-2"
                >
                  Resume draft
                  <ArrowUpRightIcon className="size-3.5" />
                </Button>
              </div>
            ) : null}
          </div>

          {canCreateRota ? (
            <div className="flex flex-wrap gap-2">
              <NewRotaDialog
                locations={data.locations}
                selectedLocation={data.selectedLocation}
                triggerLabel="Use template"
                triggerVariant="pill"
                triggerIcon="template"
                disabled={!canCreateRota}
                defaultSourceType="template"
                workspaceType={data.workspaceType}
              />
              <NewRotaDialog
                locations={data.locations}
                selectedLocation={data.selectedLocation}
                triggerLabel="New rota"
                triggerVariant="raised"
                triggerClassName="border-sky-700 bg-sky-600 focus-visible:border-sky-800 focus-visible:ring-sky-500/30 hover:bg-sky-700"
                triggerIcon="plus"
                disabled={!canCreateRota}
                defaultSourceType="blank"
                workspaceType={data.workspaceType}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <Card className="overflow-hidden border-border/70 bg-background/95 shadow-sm">
          <CardContent className="p-0">
            <RotaListFilters
              locations={data.locations}
              selectedLocationId={data.selectedLocation?.id}
              status={data.filters.status}
              range={data.filters.range}
              from={data.filters.from}
              to={data.filters.to}
              pageSize={data.filters.pageSize}
              totalItems={data.pagination.totalItems}
              showStatusFilter={canEditRotas}
              pageSizeOptions={rotaPageSizeValues}
              onLocationChange={onLocationChange}
              onStatusChange={onStatusChange}
              onRangeChange={onRangeChange}
              onPageSizeChange={onPageSizeChange}
              onCustomRangeChange={onCustomRangeChange}
            />

            {!data.selectedLocation ? (
              <div className="p-4 sm:p-5">
                <Empty className="border border-dashed border-border/70 bg-muted/10 py-10">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MapPinIcon className="size-4" />
                    </EmptyMedia>
                    <EmptyTitle>No rota access yet</EmptyTitle>
                    <EmptyDescription>
                      Your account is in this organization, but you do not
                      currently have access to any locations with rota
                      visibility.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            ) : data.rows.length === 0 ? (
              <div className="p-4 sm:p-5">
                <Empty className="border border-dashed border-border/70 bg-muted/10 py-10">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CalendarRangeIcon className="size-4" />
                    </EmptyMedia>
                    <EmptyTitle>No rotas match these filters</EmptyTitle>
                    <EmptyDescription>
                      {canCreateRota
                        ? `Start the first week for ${data.selectedLocation.name} or adjust the filters to bring older weeks back into view.`
                        : "There are no published rotas available for the selected period."}
                    </EmptyDescription>
                  </EmptyHeader>
                  {canCreateRota ? (
                    <EmptyContent>
                      <NewRotaDialog
                        locations={data.locations}
                        selectedLocation={data.selectedLocation}
                        triggerLabel="Create rota"
                        triggerVariant="default"
                        triggerIcon="plus"
                        triggerClassName="w-full sm:w-auto"
                        defaultSourceType="blank"
                        workspaceType={data.workspaceType}
                      />
                    </EmptyContent>
                  ) : null}
                </Empty>
              </div>
            ) : (
              <>
                <div className="hidden border-b border-border/60 bg-muted/20 px-4 py-2 text-[11px] font-medium text-muted-foreground sm:px-5 md:grid md:grid-cols-[minmax(13rem,1.35fr)_minmax(7rem,0.75fr)_7rem_5rem_minmax(8rem,0.85fr)_8rem] md:items-center">
                  <span>Week range</span>
                  <span>Created by</span>
                  <span>Status</span>
                  <span>Shifts</span>
                  <span>Location</span>
                  <span className="text-right">Actions</span>
                </div>

                <div className="divide-y divide-border/60">
                  {data.rows.map((row) => (
                    <RotaListRow
                      key={row.id}
                      canEdit={canEditRotas}
                      orgSlug={data.orgSlug}
                      workspaceType={data.workspaceType}
                      locationWorkspaceSlug={data.locationWorkspaceSlug}
                      row={row}
                      isDeletingDraft={
                        deleteDraftMutation.isPending &&
                        deleteDraftMutation.variables?.rotaId === row.id
                      }
                      isUnpublishing={
                        unpublishMutation.isPending &&
                        unpublishMutation.variables?.rotaId === row.id
                      }
                      onDeleteDraft={(rotaId) => {
                        setPendingLifecycleAction({
                          rotaId,
                          type: "delete-draft",
                          weekLabel: row.weekLabel,
                        })
                      }}
                      onUnpublish={(rotaId) => {
                        setPendingLifecycleAction({
                          rotaId,
                          type: "unpublish",
                          weekLabel: row.weekLabel,
                        })
                      }}
                    />
                  ))}
                </div>

                <Separator />

                <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <p className="text-xs text-muted-foreground">
                    Showing {firstVisibleItem} to {lastVisibleItem} of{" "}
                    {data.pagination.totalItems} rotas
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      type="button"
                      variant="pill"
                      onClick={() => onPageChange(data.pagination.page - 1)}
                      disabled={data.pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      variant="pill"
                      onClick={() => onPageChange(data.pagination.page + 1)}
                      disabled={
                        data.pagination.page >= data.pagination.totalPages
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={pendingLifecycleAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingLifecycleAction(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <TriangleAlertIcon className="size-4" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {pendingLifecycleAction?.type === "unpublish"
                ? "Unpublish this rota?"
                : "Delete this draft rota?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingLifecycleAction?.type === "unpublish"
                ? `${pendingLifecycleAction.weekLabel} will be removed from the employee view and returned to draft status.`
                : `${pendingLifecycleAction?.weekLabel} will be permanently removed.`}
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
              variant={
                pendingLifecycleAction?.type === "unpublish"
                  ? "outline"
                  : "destructive"
              }
              disabled={
                deleteDraftMutation.isPending || unpublishMutation.isPending
              }
              onClick={() => {
                if (!pendingLifecycleAction) {
                  return
                }

                const action =
                  pendingLifecycleAction.type === "unpublish"
                    ? unpublishMutation.mutateAsync({
                        rotaId: pendingLifecycleAction.rotaId,
                      })
                    : deleteDraftMutation.mutateAsync({
                        rotaId: pendingLifecycleAction.rotaId,
                      })

                void action.finally(() => {
                  setPendingLifecycleAction(null)
                })
              }}
            >
              {pendingLifecycleAction?.type === "unpublish"
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
    </div>
  )
}

export { RotaListPage }
