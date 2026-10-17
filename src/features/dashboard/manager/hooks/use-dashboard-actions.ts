import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { resolveDashboardArrival } from "../server-fns"
import { managerDashboardKeys } from "../query-options"
import type {
  ClockAction,
  ClockShiftSegment,
  ManagerClockEmployee,
} from "@/features/time-clock/types"
import type {
  AttentionItem,
  ManagerDayData,
  ResolveArrivalInput,
  TeamRow,
} from "../types"
import { useManagerClockMutations } from "@/features/time-clock/hooks/use-time-clock-mutations"
import { showErrorToast, showSuccessToast } from "@/lib/toast"
import { getDateKeyInTimeZone } from "@/lib/time-zone"

type DashboardActionRequest =
  | {
      kind: "clock"
      employee: ManagerClockEmployee
      action: ClockAction
      segment: ClockShiftSegment
    }
  | { kind: "review" | "arrival"; item: AttentionItem }
  | null

function useDashboardActions(organizationId: string, userId: string) {
  const [request, setRequest] = useState<DashboardActionRequest>(null)
  const clock = useManagerClockMutations({ organizationId, userId })
  const client = useQueryClient()
  const resolve = useServerFn(resolveDashboardArrival)
  const arrival = useMutation({
    mutationFn: (input: ResolveArrivalInput) => resolve({ data: input }),
    onSuccess: async () => {
      setRequest(null)
      await client.invalidateQueries({ queryKey: managerDashboardKeys.all })
      showSuccessToast("Arrival review recorded.")
    },
    onError: (error) =>
      showErrorToast(error, {
        fallbackMessage: "We could not resolve this arrival.",
      }),
  })
  function openClock(row: TeamRow, action: ClockAction, data: ManagerDayData) {
    const employee = data.clockEmployees.find(
      (item) => item.id === row.employeeId
    )
    if (employee)
      setRequest({ kind: "clock", employee, action, segment: row.segment })
  }
  function reviewTeam(row: TeamRow, data: ManagerDayData) {
    if (!row.entryId || !row.clockedInAt) return
    setRequest({
      kind: "review",
      item: {
        id: row.entryId,
        kind: row.requiresReview ? "review" : "missing_clock_out",
        employeeId: row.employeeId,
        employeeName: row.employeeName,
        locationId: data.location.id,
        locationName: data.location.name,
        timeZone: data.location.timeZone,
        occurredAt: row.clockedInAt,
        clockedOutAt: row.clockedOutAt,
        workDate:
          row.workDate ??
          getDateKeyInTimeZone(row.clockedInAt, data.location.timeZone),
        segment: row.segment,
        assignmentId: row.assignmentId,
        reason:
          row.notes ??
          (row.requiresReview
            ? "No reason was recorded for this review."
            : "No additional notes were recorded."),
      },
    })
  }
  return { request, setRequest, clock, arrival, openClock, reviewTeam }
}
export { useDashboardActions }
export type { DashboardActionRequest }
