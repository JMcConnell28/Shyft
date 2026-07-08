"use client"

import * as React from "react"
import { FileDownIcon, LoaderCircleIcon } from "lucide-react"
import type { VariantProps } from "class-variance-authority"

import { Button, buttonVariants } from "@/components/ui/button"
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
import type {
  SageTimesheetExportInput,
  TimesheetExportableRota,
} from "@/features/timesheets/types"
import { cn } from "@/lib/utils"

type SageTimesheetExportButtonProps = VariantProps<typeof buttonVariants> & {
  className?: string
  disabledReason?: string | null
  input: Omit<SageTimesheetExportInput, "rotaId">
  label?: string
  rotaId?: string | null
  rotas?: TimesheetExportableRota[]
}

function SageTimesheetExportButton({
  className,
  disabledReason,
  input,
  label = "Export Sage payroll CSV",
  rotaId,
  rotas = [],
  size = "default",
  variant = "outline",
}: SageTimesheetExportButtonProps) {
  const { exportCsv, isExporting } = useSageTimesheetExport(input)
  const [open, setOpen] = React.useState(false)
  const [selectedRotaId, setSelectedRotaId] = React.useState("")
  const resolvedRotaId = rotaId ?? (rotas.length === 1 ? rotas[0]?.id : null)
  const hasMultipleRotas = !rotaId && rotas.length > 1
  const isDisabled =
    Boolean(disabledReason) ||
    isExporting ||
    (!resolvedRotaId && !hasMultipleRotas)
  const title =
    disabledReason ??
    (!resolvedRotaId && !hasMultipleRotas
      ? "No published rota is available to export."
      : undefined)

  async function handleDirectExport() {
    if (!resolvedRotaId) {
      return
    }

    await exportCsv(resolvedRotaId)
  }

  async function handleSelectedExport() {
    if (!selectedRotaId) {
      return
    }

    await exportCsv(selectedRotaId)
    setOpen(false)
    setSelectedRotaId("")
  }

  if (hasMultipleRotas) {
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
                Choose the published rota to include in the payroll export.
              </DialogDescription>
            </DialogHeader>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Published rota</span>
              <select
                value={selectedRotaId}
                onChange={(event) => setSelectedRotaId(event.target.value)}
                className={cn(
                  "h-9 rounded-md border border-border bg-background px-3 text-sm outline-none",
                  "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                )}
              >
                <option value="">Choose a rota</option>
                {rotas.map((rota) => (
                  <option key={rota.id} value={rota.id}>
                    {rota.label}
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
              disabled={!selectedRotaId || isExporting}
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
