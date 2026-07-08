"use client"

import * as React from "react"
import { FileDown, LoaderCircle } from "lucide-react"

import type { RotaPdfStatKey } from "@/features/rota/types/rota-pdf"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { rotaToolbarButtonClassName } from "@/features/rota/constants/rota-toolbar-styles"
import { useExportRotaPdf } from "@/features/rota/hooks/use-export-rota-pdf"

const statOptions: Array<{
  key: RotaPdfStatKey
  label: string
  description: string
}> = [
  {
    key: "scheduledHours",
    label: "Scheduled hours",
    description: "Show total scheduled hours for each zone page.",
  },
  {
    key: "labourCost",
    label: "Labour cost",
    description: "Show estimated labour cost on the export.",
  },
  {
    key: "shiftCount",
    label: "Shift count",
    description: "Show how many shifts are on the zone page.",
  },
]

function RotaExportDialog() {
  const { canExport, exportPdf, isExporting } = useExportRotaPdf()
  const [open, setOpen] = React.useState(false)
  const [visibleStats, setVisibleStats] = React.useState<Array<RotaPdfStatKey>>(
    ["scheduledHours", "labourCost", "shiftCount"]
  )

  function toggleStat(statKey: RotaPdfStatKey, checked: boolean) {
    setVisibleStats((current) => {
      if (checked) {
        return current.includes(statKey) ? current : [...current, statKey]
      }

      return current.filter((entry) => entry !== statKey)
    })
  }

  async function handleExport() {
    await exportPdf({
      visibleStats,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="pill"
            size="icon"
            disabled={!canExport}
            aria-label="Export rota"
            className={rotaToolbarButtonClassName}
          />
        }
      >
        <FileDown data-icon="inline-start" />
        <span className="hidden group-data-[toolbar-more=true]/toolbar-more:inline md:inline">
          Export
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-md gap-5 p-0">
        <div className="space-y-5 p-4">
          <DialogHeader>
            <DialogTitle>Export rota PDF</DialogTitle>
            <DialogDescription>
              Create a print-friendly PDF of the current rota with one page per
              zone and seven day columns.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Visible stats
            </p>
            <div className="space-y-3">
              {statOptions.map((option) => {
                const checked = visibleStats.includes(option.key)

                return (
                  <label
                    key={option.key}
                    className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-3"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(nextChecked) =>
                        toggleStat(option.key, Boolean(nextChecked))
                      }
                    />
                    <span className="space-y-1">
                      <span className="block text-sm font-medium text-foreground">
                        {option.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
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
            disabled={isExporting}
            onClick={() => void handleExport()}
          >
            {isExporting ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : (
              <FileDown data-icon="inline-start" />
            )}
            Export PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { RotaExportDialog }
