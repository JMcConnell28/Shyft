"use client"

import * as React from "react"
import { useServerFn } from "@tanstack/react-start"

import { getSageTimesheetExportData } from "@/features/timesheets/server-fns"
import type { SageTimesheetExportInput } from "@/features/timesheets/types"
import { serializeSageTimesheetExportCsv } from "@/features/timesheets/utils/sage-timesheet-export"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useSageTimesheetExport(
  input: Omit<SageTimesheetExportInput, "rotaId">
) {
  const getSageTimesheetExportDataFn = useServerFn(getSageTimesheetExportData)
  const [isExporting, setIsExporting] = React.useState(false)

  const exportCsv = React.useCallback(
    async (rotaId: string) => {
      if (isExporting) {
        return
      }

      setIsExporting(true)

      try {
        const exportData = await getSageTimesheetExportDataFn({
          data: {
            ...input,
            rotaId,
          },
        })
        const csv = serializeSageTimesheetExportCsv(exportData)
        downloadTextFile(csv, exportData.fileName, "text/csv;charset=utf-8")
        showSuccessToast("Your Sage payroll CSV is ready.")
      } catch (error) {
        showErrorToast(error, {
          fallbackMessage: "We could not export that Sage payroll CSV.",
        })
      } finally {
        setIsExporting(false)
      }
    },
    [getSageTimesheetExportDataFn, input, isExporting]
  )

  return {
    exportCsv,
    isExporting,
  }
}

function downloadTextFile(text: string, fileName: string, type: string) {
  const blob = new Blob([text], { type })
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = downloadUrl
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(downloadUrl)
  }, 1000)
}

export { useSageTimesheetExport }
