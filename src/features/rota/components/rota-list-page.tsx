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
import { RotaWelcomeDialog } from "@/features/rota/components/rota-welcome-dialog"
import { useDeleteDraftRota } from "@/features/rota/hooks/use-delete-draft-rota"
import { useUnpublishRota } from "@/features/rota/hooks/use-unpublish-rota"
import { isRotaWeekBeforeCurrentWeek } from "@/features/rota/utils/week-utils"
import { rotaPageSizeValues } from "@/lib/rota-schemas"

type RotaListPageProps = {
  data: RotaListPageData
  userId: string
  onLocationChange: (locationSlug: string) => void
  onStatusChange: (status: RotaStatusFilter) => void
  onRangeChange: (range: RotaRangeFilter) => void
  onCustomRangeChange: (value: { from?: string; to?: string }) => void
  onPageSizeChange: (pageSize: RotaPageSize) => void
  onPageChange: (page: number) => void
}

function RotaListPage({
  data,
  userId,
  onLocationChange,
  onStatusChange,
  onRangeChange,
  onCustomRangeChange,
  onPageSizeChange,
  onPageChange,
}: RotaListPageProps) {
  const deleteDraftMutation = useDeleteDraftRota()
  const unpublishMutation = useUnpublishRota()
  const canEditRotas =
    data.capabilities.canManageRota && data.canWriteSelectedLocation
  const canCreateRota =
    data.capabilities.canCreateRota &&
    data.canWriteSelectedLocation &&
    Boolean(data.selectedLocation)
  const [pendingLifecycleAction, setPendingLifecycleAction] = React.useState<{
    rotaId: string
    type: "delete-draft" | "unpublish"
    weekLabel: string
  } | null>(null)
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
      {data.capabilities.canManageRota ? (
        <RotaWelcomeDialog
          organizationId={data.organizationId}
          userId={userId}
        />
      ) : null}
      <MobileRotaList
        data={data}
        canCreateRota={canCreateRota}
        canEditRotas={canEditRotas}
        onLocationChange={onLocationChange}
        onPageSizeChange={onPageSizeChange}
        onRangeChange={onRangeChange}
        onStatusChange={onStatusChange}
      />

      <div className="hidden flex-1 flex-col overflow-x-hidden bg-white text-[#10285c] md:flex">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8 lg:px-10">
          <header>
            <h1 className="text-[30px] leading-none font-bold tracking-[-0.035em]">
              Rota list
            </h1>
            <p className="mt-2.5 text-sm font-medium text-[#526991]">
              View, edit and manage your rotas.
            </p>
          </header>

          <section className="mt-7 flex flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1">
              <RotaListFilters
                locations={data.locations}
                selectedLocationId={data.selectedLocation?.id}
                status={data.filters.status}
                range={data.filters.range}
                from={data.filters.from}
                to={data.filters.to}
                pageSize={data.filters.pageSize}
                showStatusFilter={canEditRotas}
                pageSizeOptions={rotaPageSizeValues}
                onLocationChange={onLocationChange}
                onStatusChange={onStatusChange}
                onRangeChange={onRangeChange}
                onPageSizeChange={onPageSizeChange}
                onCustomRangeChange={onCustomRangeChange}
              />
            </div>
            {canCreateRota ? (
              <NewRotaDialog
                locations={data.locations}
                selectedLocation={data.selectedLocation}
                triggerLabel="New rota"
                triggerIcon="plus"
                triggerClassName="h-10 shrink-0 rounded-[10px] border-0 bg-[#0868f7] px-4 text-[13px] font-semibold text-white shadow-[0_7px_16px_rgba(8,104,247,0.18)] hover:bg-[#005de2]"
                defaultSourceType="blank"
                workspaceType={data.workspaceType}
              />
            ) : null}
          </section>

          <div className="mt-7 mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.055em] text-[#526991] uppercase">
              <span>All rotas</span>
              <span className="flex size-7 items-center justify-center rounded-full bg-[#f0f3f9] tracking-normal">
                {data.pagination.totalItems}
              </span>
            </div>
            {data.latestDraft && canEditRota(data.latestDraft.weekStart) ? (
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
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0868f7] hover:underline"
              >
                Resume latest draft
                <ArrowUpRightIcon className="size-3.5" />
              </Link>
            ) : null}
          </div>

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
                    triggerClassName="h-10 rounded-[10px] border-0 bg-[#0868f7] px-4 text-sm font-semibold text-white hover:bg-[#005de2]"
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

              <div className="flex flex-col gap-3 border-t border-[#e0e7f1] px-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium text-[#607399]">
                  Showing {firstVisibleItem} to {lastVisibleItem} of{" "}
                  {data.pagination.totalItems} rotas
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    className="h-8 rounded-lg border-[#d8e2f0] bg-white px-3 text-xs font-semibold text-[#0765e8] shadow-none"
                    onClick={() => onPageChange(data.pagination.page - 1)}
                    disabled={data.pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    className="h-8 rounded-lg border-[#d8e2f0] bg-white px-3 text-xs font-semibold text-[#0765e8] shadow-none"
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
    <div className="rounded-[11px] border border-dashed border-[#d7e0ed] bg-white px-6 py-12 text-center shadow-[0_3px_10px_rgba(30,50,96,0.065)]">
      <span className="mx-auto flex size-11 items-center justify-center rounded-[10px] border border-blue-100 bg-blue-50 text-[#0868f7]">
        <Icon className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold tracking-[-0.01em] text-[#10285c]">
        {title}
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm font-medium text-[#526991]">
        {message}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

export { RotaListPage }
