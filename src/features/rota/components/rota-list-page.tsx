"use client"

import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowUpRightIcon,
  CalendarRangeIcon,
  MapPinIcon,
  TriangleAlertIcon,
} from "lucide-react"

import type {
  RotaPageSize,
  RotaRangeFilter,
  RotaStatusFilter,
} from "@/features/rota/schemas/rota-schemas"
import type { RotaListPageData } from "@/features/rota/types"
import { NewRotaDialog } from "@/components/app/new-rota-dialog"
import { Button } from "@/components/ui/button"
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
import { MobileRotaList } from "@/features/rota/components/mobile-rota-list"
import { RotaListFilters } from "@/features/rota/components/rota-list-filters"
import { RotaListRow } from "@/features/rota/components/rota-list-row"
import { useDeleteDraftRota } from "@/features/rota/hooks/use-delete-draft-rota"
import { useUnpublishRota } from "@/features/rota/hooks/use-unpublish-rota"
import { isRotaWeekBeforeCurrentWeek } from "@/features/rota/utils/week-utils"
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
  const canEditRota = React.useCallback(
    (weekStart: string) =>
      canEditRotas && !isRotaWeekBeforeCurrentWeek(weekStart),
    [canEditRotas]
  )

  return (
    <div className="flex flex-1 flex-col overflow-x-hidden">
      <MobileRotaList
        data={data}
        canCreateRota={canCreateRota}
        canEditRotas={canEditRotas}
        isDeletingDraft={(rotaId) =>
          deleteDraftMutation.isPending &&
          deleteDraftMutation.variables.rotaId === rotaId
        }
        isUnpublishing={(rotaId) =>
          unpublishMutation.isPending &&
          unpublishMutation.variables.rotaId === rotaId
        }
        onDeleteDraft={(rotaId, weekLabel) => {
          setPendingLifecycleAction({
            rotaId,
            type: "delete-draft",
            weekLabel,
          })
        }}
        onLocationChange={onLocationChange}
        onPageSizeChange={onPageSizeChange}
        onRangeChange={onRangeChange}
        onStatusChange={onStatusChange}
        onUnpublish={(rotaId, weekLabel) => {
          setPendingLifecycleAction({
            rotaId,
            type: "unpublish",
            weekLabel,
          })
        }}
      />

      <div className="hidden flex-1 flex-col overflow-x-hidden bg-[#f7f8fb] text-[#11245a] md:flex">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-5 py-5">
          <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-[2.4rem] leading-none font-extrabold tracking-[-0.055em]">
                Rotas
              </h1>
              <p className="mt-2 text-sm font-semibold text-[#61709a]">
                {data.selectedLocation?.name ?? "Choose a location"}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {compactOverview.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#61709a] ring-1 ring-[#e7eaf2]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {canCreateRota ? (
              <div className="flex flex-wrap gap-2">
                <NewRotaDialog
                  locations={data.locations}
                  selectedLocation={data.selectedLocation}
                  triggerLabel="New rota"
                  triggerIcon="plus"
                  disabled={!canCreateRota}
                  defaultSourceType="blank"
                  workspaceType={data.workspaceType}
                />
              </div>
            ) : null}
          </section>

          {data.latestDraft && canEditRota(data.latestDraft.weekStart) ? (
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-neutral-200 bg-white px-4 py-3 shadow-sm">
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold tracking-[0.08em] text-[#7a86a4] uppercase">
                  Latest draft
                </p>
                <p className="mt-1 truncate text-sm font-extrabold text-[#11245a]">
                  {data.latestDraft.weekLabel}
                </p>
                <p className="mt-0.5 text-xs font-medium text-[#7a86a4]">
                  Updated {data.latestDraft.updatedAt}
                </p>
              </div>
              <Button
                variant="base"
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
                className="h-9 gap-1.5 text-xs font-extrabold text-[#0069ff] hover:bg-[#f7f8fb] hover:text-[#0069ff] focus-visible:ring-[#0069ff] active:bg-[#e6f0ff] active:text-[#0069ff]"
              >
                Resume draft
                <ArrowUpRightIcon className="size-3.5" />
              </Button>
            </section>
          ) : null}

          <section className="rounded-[22px] bg-white shadow-[0_8px_24px_rgba(30,50,96,0.05)] ring-1 ring-[#e7eaf2]">
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
          </section>

          {!data.selectedLocation ? (
            <DesktopEmptyState
              icon={MapPinIcon}
              title="No rota access yet"
              message="Your account is in this organization, but you do not currently have access to any locations with rota visibility."
            />
          ) : data.rows.length === 0 ? (
            <DesktopEmptyState
              icon={CalendarRangeIcon}
              title="No rotas match these filters"
              message={
                canCreateRota
                  ? `Start the first week for ${data.selectedLocation.name} or adjust the filters to bring older weeks back into view.`
                  : "There are no published rotas available for the selected period."
              }
              action={
                canCreateRota ? (
                  <NewRotaDialog
                    locations={data.locations}
                    selectedLocation={data.selectedLocation}
                    triggerLabel="Create rota"
                    triggerIcon="plus"
                    triggerClassName="h-10 rounded-2xl border-0 bg-[#00a84f] px-4 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(0,168,79,0.18)] hover:bg-[#009647]"
                    defaultSourceType="blank"
                    workspaceType={data.workspaceType}
                  />
                ) : null
              }
            />
          ) : (
            <section className="space-y-2.5">
              {data.rows.map((row) => (
                <RotaListRow
                  key={row.id}
                  canEdit={canEditRota(row.weekStart)}
                  orgSlug={data.orgSlug}
                  workspaceType={data.workspaceType}
                  locationWorkspaceSlug={data.locationWorkspaceSlug}
                  row={row}
                  isDeletingDraft={
                    deleteDraftMutation.isPending &&
                    deleteDraftMutation.variables.rotaId === row.id
                  }
                  isUnpublishing={
                    unpublishMutation.isPending &&
                    unpublishMutation.variables.rotaId === row.id
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

              <div className="flex flex-col gap-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(30,50,96,0.04)] ring-1 ring-[#e7eaf2] sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold text-[#7a86a4]">
                  Showing {firstVisibleItem} to {lastVisibleItem} of{" "}
                  {data.pagination.totalItems} rotas
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    type="button"
                    variant="pill"
                    className="h-8 rounded-xl border-[#e1e7f2] bg-white px-3 text-xs font-extrabold text-[#0069ff] shadow-none"
                    onClick={() => onPageChange(data.pagination.page - 1)}
                    disabled={data.pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="pill"
                    className="h-8 rounded-xl border-[#e1e7f2] bg-white px-3 text-xs font-extrabold text-[#0069ff] shadow-none"
                    onClick={() => onPageChange(data.pagination.page + 1)}
                    disabled={
                      data.pagination.page >= data.pagination.totalPages
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>
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

function DesktopEmptyState({
  action,
  icon: Icon,
  message,
  title,
}: {
  action?: React.ReactNode
  icon: typeof CalendarRangeIcon
  message: string
  title: string
}) {
  return (
    <div className="rounded-[22px] border border-dashed border-[#dfe5f0] bg-white px-6 py-12 text-center shadow-[0_8px_24px_rgba(30,50,96,0.05)]">
      <span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#0069ff]">
        <Icon className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-extrabold tracking-[-0.025em] text-[#11245a]">
        {title}
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm font-medium text-[#61709a]">
        {message}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

export { RotaListPage }
