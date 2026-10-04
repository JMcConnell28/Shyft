"use client"

import * as React from "react"
import { FileDownIcon, LoaderCircleIcon } from "lucide-react"
import type {
  SageTimesheetExportInput,
  TimesheetLocation,
} from "@/features/timesheets/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSageTimesheetExport } from "@/features/timesheets/hooks/use-sage-timesheet-export"
import { cn } from "@/lib/utils"

type SageTimesheetExportButtonProps = Pick<
  React.ComponentProps<typeof Button>,
  "size" | "variant"
> & {
  className?: string
  disabledReason?: string | null
  input: Omit<SageTimesheetExportInput, "exportLocationId">
  label?: string
  exportLocationId?: string | null
  locations?: Array<TimesheetLocation>
}

function SageTimesheetExportButton({
  className,
  disabledReason,
  input,
  label = "Export Sage payroll CSV",
  exportLocationId,
  locations = [],
  size = "default",
  variant = "outline",
}: SageTimesheetExportButtonProps) {
  const { exportCsv, isExporting } = useSageTimesheetExport(input)
  const [open, setOpen] = React.useState(false)
  const [selectedLocationId, setSelectedLocationId] = React.useState("")
  const resolvedLocationId =
    exportLocationId ?? (locations.length === 1 ? locations[0]?.id : null)
  const hasMultipleLocations = !exportLocationId && locations.length > 1
  const isDisabled =
    Boolean(disabledReason) ||
    isExporting ||
    (!resolvedLocationId && !hasMultipleLocations)
  const title =
    disabledReason ??
    (!resolvedLocationId && !hasMultipleLocations
      ? "No location is available to export."
      : undefined)

  async function handleDirectExport() {
    if (!resolvedLocationId) {
      return
    }

    await exportCsv(resolvedLocationId)
  }

  async function handleSelectedExport() {
    if (!selectedLocationId) {
      return
    }

    await exportCsv(selectedLocationId)
    setOpen(false)
    setSelectedLocationId("")
  }

  if (hasMultipleLocations) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button
              type="button"
              variant={variant}
              size={size}
              disabled={isDisabled}
              title={title}
              className={className}
            />
          }
        >
          <ExportButtonContent isExporting={isExporting} label={label} />
        </DialogTrigger>
        <DialogContent className="max-w-md gap-5 p-0">
          <div className="space-y-5 p-4">
            <DialogHeader>
              <DialogTitle>Export Sage payroll CSV</DialogTitle>
              <DialogDescription>
                Choose the location to include for this timesheet week.
              </DialogDescription>
            </DialogHeader>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Location</span>
              <select
                value={selectedLocationId}
                onChange={(event) => setSelectedLocationId(event.target.value)}
                className={cn(
                  "h-9 rounded-md border border-border bg-background px-3 text-sm outline-none",
                  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                )}
              >
                <option value="">Choose a location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <DialogFooter className="mx-0 mb-0 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              disabled={isExporting}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!selectedLocationId || isExporting}
              onClick={() => void handleSelectedExport()}
            >
              <ExportButtonContent
                isExporting={isExporting}
                label="Export CSV"
              />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={isDisabled}
      title={title}
      className={className}
      onClick={() => void handleDirectExport()}
    >
      <ExportButtonContent isExporting={isExporting} label={label} />
    </Button>
  )
}

function ExportButtonContent({
  isExporting,
  label,
}: {
  isExporting: boolean
  label: string
}) {
  return (
    <>
      {isExporting ? (
        <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
      ) : (
        <FileDownIcon data-icon="inline-start" />
      )}
      <span>{label}</span>
    </>
  )
}

export { SageTimesheetExportButton }
