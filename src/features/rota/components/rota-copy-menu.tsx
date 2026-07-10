"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import {
  CalendarRange,
  ChevronDown,
  Copy,
  LoaderCircle,
  SquareChartGantt,
  TriangleAlertIcon,
} from "lucide-react"

import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { rotaQueryKeys } from "@/features/rota/query-keys"
import { copyRotaBoard } from "@/features/rota/server-fns"
import type {
  CopyRotaBoardMode,
  CopyRotaBoardResult,
} from "@/features/rota/types"
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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function RotaCopyMenu() {
  const queryClient = useQueryClient()
  const copyRotaBoardFn = useServerFn(copyRotaBoard)
  const { meta } = useRotaWorkspace()
  const [pendingMode, setPendingMode] = React.useState<CopyRotaBoardMode | null>(
    null,
  )
  const [warningState, setWarningState] = React.useState<
    | {
        title: string
        description: string
      }
    | null
  >(null)
  const [summaryResult, setSummaryResult] =
    React.useState<Extract<CopyRotaBoardResult, { status: "success" }> | null>(
      null,
    )

  const copyMutation = useMutation({
    meta: {
      disableErrorToast: true,
    },
    mutationFn: (mode: CopyRotaBoardMode) =>
      copyRotaBoardFn({
        data: {
          rotaId: meta.rotaId,
          mode,
        },
      }),
    onSuccess: async (result, mode) => {
      setPendingMode(null)

      if (result.status === "unavailable") {
        setWarningState({
          title: "No previous rota to copy",
          description:
            "There is no earlier rota for this location yet, so there is nothing to copy from.",
        })
        return
      }

      await queryClient.invalidateQueries({
        queryKey: rotaQueryKeys.all,
      })

      showSuccessToast(
        mode === "full"
          ? "Previous rota copied."
          : "Previous shifts copied.",
      )

      if (result.skippedEmployees.length > 0) {
        setSummaryResult(result)
      }
    },
    onError: (error) => {
      setPendingMode(null)
      showErrorToast(error, {
        fallbackMessage: "We could not copy the previous rota.",
      })
    },
  })

  function handleSelectMode(mode: CopyRotaBoardMode) {
    if (meta.status !== "draft") {
      setWarningState({
        title: "Copy is only available on drafts",
        description:
          "Open a draft rota to copy a previous week into it. Published rotas cannot be overwritten.",
      })
      return
    }

    setPendingMode(mode)
  }

  function handleConfirmCopy() {
    if (!pendingMode || copyMutation.isPending) {
      return
    }

    void copyMutation.mutateAsync(pendingMode)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="pill" disabled={copyMutation.isPending}>
              {copyMutation.isPending ? (
                <LoaderCircle data-icon="inline-start" className="animate-spin" />
              ) : (
                <Copy data-icon="inline-start" />
              )}
              Copy
              <ChevronDown data-icon="inline-end" />
            </Button>
          }
        />
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Previous week</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleSelectMode("full")}
              className="items-start py-2"
            >
              <CalendarRange className="mt-0.5" />
              <div className="min-w-0">
                <div className="font-medium">Full rota</div>
                <div className="text-[11px] text-muted-foreground">
                  Replace with shifts, staff assignments, and notes.
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSelectMode("shifts-only")}
              className="items-start py-2"
            >
              <SquareChartGantt className="mt-0.5" />
              <div className="min-w-0">
                <div className="font-medium">Shifts only</div>
                <div className="text-[11px] text-muted-foreground">
                  Replace with shifts only and leave notes unchanged.
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={pendingMode !== null}
        onOpenChange={(open) => {
          if (!open && !copyMutation.isPending) {
            setPendingMode(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <TriangleAlertIcon className="size-4" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {pendingMode === "full" ? "Copy full rota?" : "Copy shifts only?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingMode === "full"
                ? "This will replace the current shifts, assignments, and notes in this draft with the most recent previous rota for this location."
                : "This will replace the current shifts and assignments in this draft with the most recent previous rota for this location. Your current note will stay as it is."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={copyMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={copyMutation.isPending}
              onClick={handleConfirmCopy}
            >
              {copyMutation.isPending ? "Copying..." : "Replace rota"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={warningState !== null}
        onOpenChange={(open) => {
          if (!open) {
            setWarningState(null)
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <TriangleAlertIcon className="size-4" />
            </AlertDialogMedia>
            <AlertDialogTitle>{warningState?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {warningState?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={summaryResult !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSummaryResult(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <TriangleAlertIcon className="size-4" />
            </AlertDialogMedia>
            <AlertDialogTitle>Some staff were not carried over</AlertDialogTitle>
            <AlertDialogDescription>
              {summaryResult
                ? `${summaryResult.sourceWeekLabel} was copied, but ${summaryResult.skippedEmployees.length} team member${summaryResult.skippedEmployees.length === 1 ? "" : "s"} could not be carried over.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {summaryResult ? (
            <div className="space-y-3 rounded-lg border bg-muted/20 p-3 text-xs">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
                <span>{summaryResult.copiedShiftCount} shifts copied</span>
                <span>{summaryResult.copiedAssignmentCount} assignments copied</span>
              </div>
              <div className="space-y-2">
                {summaryResult.skippedEmployees.map((employee) => (
                  <div
                    key={`${employee.employeeId}-${employee.reason}`}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="font-medium text-foreground">
                      {employee.employeeName}
                    </span>
                    <span className="text-right text-muted-foreground">
                      {getSkippedReasonLabel(employee.reason)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function getSkippedReasonLabel(reason: "missing" | "inactive" | "not-assigned") {
  if (reason === "inactive") {
    return "No longer active"
  }

  if (reason === "not-assigned") {
    return "Not assigned to this location"
  }

  return "No longer in the organization"
}

export default RotaCopyMenu
