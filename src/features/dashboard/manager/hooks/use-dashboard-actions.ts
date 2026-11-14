import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { resolveDashboardArrival } from "../server-fns"
import { managerDashboardKeys } from "../query-options"
import { getTeamTimeEntry } from "../utils/team-attendance"
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
  function openClock(
    employee: ManagerClockEmployee,
    action: ClockAction,
    segment: ClockShiftSegment
  ) {
    setRequest({ kind: "clock", employee, action, segment })
  }
  function reviewTeam(row: TeamRow, data: ManagerDayData) {
    const item = getTeamTimeEntry(row, data.location)
    if (item) setRequest({ kind: "review", item })
  }
  return { request, setRequest, clock, arrival, openClock, reviewTeam }
}
export { useDashboardActions }
export type { DashboardActionRequest }
