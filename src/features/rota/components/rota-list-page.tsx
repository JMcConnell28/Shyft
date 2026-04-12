"use client"

import { Link, useNavigate } from "@tanstack/react-router"
import {
  ArrowUpRightIcon,
  CalendarRangeIcon,
  DotIcon,
  MapPinIcon,
} from "lucide-react"

import type { RotaListPageData } from "@/features/rota/types"
import type {
  RotaPageSize,
  RotaRangeFilter,
  RotaStatusFilter,
} from "@/features/rota/schemas/rota-schemas"
import { useDuplicateRotaMutation } from "@/features/rota/hooks/use-duplicate-rota-mutation"
import { NewRotaDialog } from "@/components/app/new-rota-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { LocationTabs } from "@/features/rota/components/location-tabs"
import { RotaListFilters } from "@/features/rota/components/rota-list-filters"
import { RotaListRow } from "@/features/rota/components/rota-list-row"
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
  const navigate = useNavigate()
  const duplicateRotaMutation = useDuplicateRotaMutation()
  const duplicatePendingId = duplicateRotaMutation.isPending
    ? (duplicateRotaMutation.variables?.rotaId ?? null)
    : null
  const compactOverview = [
    `${data.pagination.totalItems} weeks`,
    `${data.overview.draftRotas} drafts`,
    `${data.overview.publishedRotas} published`,
    `${data.overview.unreadPublishedRotas} unread`,
  ]

  async function handleDuplicate(rotaId: string) {
    const result = await duplicateRotaMutation.mutateAsync({
      rotaId,
    })

    await navigate({
      to: "/o/$orgSlug/rota/$locationSlug/$rotaId",
      params: result.target,
    })
  }

  const canCreateRota = Boolean(data.selectedLocation)

  return (
    <div className="flex flex-1 flex-col overflow-x-hidden">
      <div className="flex flex-col gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="space-y-1">
              <h2 className="text-md font-semibold tracking-tight">
                Weekly rota list
              </h2>
              {/* <p className="text-xs text-muted-foreground">
                Review upcoming weeks, resume draft work, and jump straight into the rota builder.
              </p> */}
            </div>

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

            {data.latestDraft ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Latest draft updated {data.latestDraft.updatedAt}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  nativeButton={false}
                  render={
                    <Link
                      to="/o/$orgSlug/rota/$locationSlug/$rotaId"
                      params={{
                        orgSlug: data.orgSlug,
                        locationSlug: data.latestDraft.locationSlug,
                        rotaId: data.latestDraft.id,
                      }}
                    />
                  }
                  className="h-6 px-0 text-foreground"
                >
                  Resume {data.latestDraft.weekLabel}
                  <ArrowUpRightIcon className="size-3.5" />
                </Button>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <NewRotaDialog
              locations={data.locations}
              selectedLocation={data.selectedLocation}
              triggerLabel="Use template"
              triggerVariant="outline"
              triggerIcon="template"
              disabled={!canCreateRota}
              defaultSourceType="template"
            />
            <NewRotaDialog
              locations={data.locations}
              selectedLocation={data.selectedLocation}
              triggerLabel="New rota"
              triggerVariant="default"
              triggerIcon="plus"
              disabled={!canCreateRota}
              defaultSourceType="blank"
            />
          </div>
        </div>

        <LocationTabs
          locations={data.locations}
          selectedLocationId={data.selectedLocation?.id}
          onLocationChange={onLocationChange}
        />
      </div>

      <div className="p-4 sm:p-5">
        <Card className="overflow-hidden border-border/70 bg-background/95 shadow-sm">
          <CardContent className="p-0">
            <RotaListFilters
              locationName={data.selectedLocation?.name}
              status={data.filters.status}
              range={data.filters.range}
              from={data.filters.from}
              to={data.filters.to}
              pageSize={data.filters.pageSize}
              totalItems={data.pagination.totalItems}
              pageSizeOptions={rotaPageSizeValues}
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
                      Start the first week for {data.selectedLocation.name} or
                      adjust the filters to bring older weeks back into view.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <NewRotaDialog
                      locations={data.locations}
                      selectedLocation={data.selectedLocation}
                      triggerLabel="Create rota"
                      triggerVariant="default"
                      triggerIcon="plus"
                      triggerClassName="w-full sm:w-auto"
                      defaultSourceType="blank"
                    />
                  </EmptyContent>
                </Empty>
              </div>
            ) : (
              <>
                <div className="divide-y divide-border/60">
                  {data.rows.map((row) => (
                    <RotaListRow
                      key={row.id}
                      orgSlug={data.orgSlug}
                      row={row}
                      isDuplicating={duplicatePendingId === row.id}
                      onDuplicate={(rotaId) => {
                        void handleDuplicate(rotaId)
                      }}
                    />
                  ))}
                </div>

                <Separator />

                <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <p className="text-xs text-muted-foreground">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => onPageChange(data.pagination.page - 1)}
                      disabled={data.pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
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
    </div>
  )
}

export { RotaListPage }
