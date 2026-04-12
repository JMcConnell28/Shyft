import { Link } from "@tanstack/react-router"
import { ArrowUpRightIcon, CopyPlusIcon, DotIcon, LoaderCircleIcon, MapPinIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatHours, getStatusVariant } from "@/features/rota/utils/formatting"

type RotaListRowData = {
  id: string
  locationName: string
  locationSlug: string
  weekLabel: string
  status: "draft" | "published"
  createdBy: string
  publishedBy: string | null
  updatedAt: string
  scheduledHours: number
  scheduledStaffCount: number
  shiftCount: number
  zoneCount: number
  note: string | null
  isUnread: boolean
}

function RotaListRow({
  orgSlug,
  row,
  isDuplicating,
  onDuplicate,
}: {
  orgSlug: string
  row: RotaListRowData
  isDuplicating: boolean
  onDuplicate: (rotaId: string) => void
}) {
  const warnings = [
    row.status === "draft" ? "Not yet published" : null,
    row.shiftCount === 0 ? "No shifts added" : null,
  ].filter(Boolean) as Array<string>

  return (
    <article className="px-4 py-3 transition-colors hover:bg-muted/10 sm:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {row.isUnread ? (
              <span className="inline-flex items-center text-rose-500">
                <DotIcon className="-mx-1 size-6" />
              </span>
            ) : null}
            <h2 className="text-sm font-semibold tracking-tight">{row.weekLabel}</h2>
            <Badge variant={getStatusVariant(row.status)}>
              {row.status === "published" ? "Published" : "Draft"}
            </Badge>
            {warnings.map((warning) => (
              <Badge key={warning} variant="outline" className="text-[10px]">
                {warning}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="size-3.5" />
              {row.locationName}
            </span>
            <span>Created by {row.createdBy}</span>
            {row.publishedBy ? <span>Published by {row.publishedBy}</span> : null}
            <span>Updated {row.updatedAt}</span>
          </div>

          {row.note?.trim() ? (
            <p className="max-w-3xl truncate text-xs text-muted-foreground">
              {row.note}
            </p>
          ) : null}

          <dl className="flex flex-wrap gap-2 text-xs">
            <StatChip label="Hours" value={formatHours(row.scheduledHours)} />
            <StatChip label="Staff" value={String(row.scheduledStaffCount)} />
            <StatChip label="Shifts" value={String(row.shiftCount)} />
            <StatChip label="Zones" value={String(row.zoneCount)} />
          </dl>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:pt-0.5">
          <Button
            size="sm"
            className="gap-2"
            nativeButton={false}
            render={
              <Link
                to="/o/$orgSlug/rota/$locationSlug/$rotaId"
                params={{
                  orgSlug,
                  locationSlug: row.locationSlug,
                  rotaId: row.id,
                }}
              />
            }
          >
            Open
            <ArrowUpRightIcon className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => onDuplicate(row.id)}
            disabled={isDuplicating}
          >
            {isDuplicating ? (
              <>
                <LoaderCircleIcon className="size-3.5 animate-spin" />
                Duplicating
              </>
            ) : (
              <>
                <CopyPlusIcon className="size-3.5" />
                Duplicate
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  )
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-baseline gap-1 rounded-md border border-border/60 bg-muted/20 px-2 py-1">
      <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}

export { RotaListRow }
