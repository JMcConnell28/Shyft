"use client"

import * as React from "react"

import type { RotaPdfExportOptions } from "@/features/rota/types/rota-pdf"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { buildRotaPdfDocumentData } from "@/features/rota/utils/rota-pdf-export"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useExportRotaPdf() {
  const {
    assignmentIdsByShiftId,
    assignmentsById,
    days,
    employeeGroups,
    employeesById,
    meta,
    selectedLocation,
    shiftsById,
    zones,
  } = useRotaWorkspace()
  const [isExporting, setIsExporting] = React.useState(false)

  const exportPdf = React.useCallback(
    async (options: RotaPdfExportOptions) => {
      if (isExporting || zones.length === 0) {
        return
      }

      setIsExporting(true)

      try {
        const brandLogoUrl =
          typeof window === "undefined"
            ? null
            : new URL(
                "/brand/rocketrota-logo.png",
                window.location.origin
              ).toString()

        const documentData = buildRotaPdfDocumentData({
          assignmentIdsByShiftId,
          assignmentsById,
          brandLogoUrl,
          days,
          employeeGroups,
          employeesById,
          location: selectedLocation,
          meta,
          options,
          shiftsById,
          zones,
        })

        const { generateRotaPdf } =
          await import("@/features/rota/utils/generate-rota-pdf")
        const blob = await generateRotaPdf(documentData)
        downloadBlob(blob, documentData.fileName)
        showSuccessToast("Your rota PDF is ready.")
      } catch (error) {
        showErrorToast(error, {
          fallbackMessage: "We could not export this rota right now.",
        })
      } finally {
        setIsExporting(false)
      }
    },
    [
      assignmentIdsByShiftId,
      assignmentsById,
      days,
      employeeGroups,
      employeesById,
      isExporting,
      meta,
      selectedLocation,
      shiftsById,
      zones,
    ]
  )

  return {
    canExport: !isExporting && zones.length > 0,
    exportPdf,
    isExporting,
  }
}

function downloadBlob(blob: Blob, fileName: string) {
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

export { useExportRotaPdf }
