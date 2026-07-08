"use client"

import * as React from "react"
import { FileUpIcon, LoaderCircleIcon } from "lucide-react"

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
import type { CompanyEmployeeListItem } from "@/features/company/types"
import { useCompanyMutations } from "@/features/company/hooks/use-company-mutations"
import {
  buildSageEmployeeImportPreview,
  type SageEmployeeImportPreview,
} from "@/features/company/utils/sage-employee-import"
import { SageEmployeeImportPreviewTable } from "@/features/company/components/sage-employee-import-preview"
import { getErrorMessage } from "@/lib/errors"

type SageEmployeeImportDialogProps = {
  employees: CompanyEmployeeListItem[]
  locationId?: string
  organizationId?: string
  userId: string
}

function SageEmployeeImportDialog({
  employees,
  locationId,
  organizationId,
  userId,
}: SageEmployeeImportDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [preview, setPreview] =
    React.useState<SageEmployeeImportPreview | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const mutations = useCompanyMutations({ organizationId, locationId, userId })
  const isImporting = mutations.payrollImportMutation.isPending

  async function handleFileChange(file: File | null) {
    setError(null)
    setPreview(null)

    if (!file) {
      return
    }

    try {
      const text = await file.text()
      setPreview(
        buildSageEmployeeImportPreview({
          employees,
          text,
        })
      )
    } catch (parseError) {
      setError(getErrorMessage(parseError, "We could not read that Sage file."))
    }
  }

  async function handleImport() {
    if (!preview || preview.updates.length === 0) {
      return
    }

    try {
      await mutations.payrollImportMutation.mutateAsync({
        updates: preview.updates,
      })
      setOpen(false)
      setPreview(null)
      setError(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (importError) {
      setError(
        getErrorMessage(
          importError,
          "We could not import those Sage payroll IDs."
        )
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" className="h-9 rounded-xl" />
        }
      >
        <FileUpIcon data-icon="inline-start" />
        Import Sage employees
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle>Import Sage employee references</DialogTitle>
          <DialogDescription>
            Upload a Sage employee export to match staff and populate payroll
            IDs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 pb-5">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            disabled={isImporting}
            className="block w-full rounded-xl border border-[#dfe5f0] bg-[#f8faff] px-3 py-2 text-sm font-semibold"
            onChange={(event) => {
              void handleFileChange(event.target.files?.[0] ?? null)
            }}
          />

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          {preview ? (
            <SageEmployeeImportPreviewTable preview={preview} />
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isImporting}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!preview || preview.updates.length === 0 || isImporting}
            onClick={() => void handleImport()}
          >
            {isImporting ? (
              <LoaderCircleIcon
                data-icon="inline-start"
                className="animate-spin"
              />
            ) : (
              <FileUpIcon data-icon="inline-start" />
            )}
            Import payroll IDs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { SageEmployeeImportDialog }
