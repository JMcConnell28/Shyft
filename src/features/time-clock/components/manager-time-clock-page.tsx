"use client"

import * as React from "react"

import type {
  ClockAction,
  ManagerClockEmployee,
  ManagerClockPageData,
} from "@/features/time-clock/types"
import { ManagerClockOverrideDialog } from "@/features/time-clock/components/manager-clock-override-dialog"
import { TimeClockDashboard } from "@/features/time-clock/components/time-clock-dashboard"
import { useLiveNow } from "@/features/time-clock/hooks/use-live-now"
import { useManagerClockMutations } from "@/features/time-clock/hooks/use-time-clock-mutations"
import { useManagerClockQuery } from "@/features/time-clock/hooks/use-time-clock-query"
import { getManagerClockEmployeeKey } from "@/features/time-clock/utils/manager-clock-employees"
import { getManagerClockStats } from "@/features/time-clock/utils/manager-clock-stats"

type ManagerTimeClockPageProps = {
  date?: string
  initialData: ManagerClockPageData
  organizationId?: string
  locationId?: string
  userId: string
  workspaceSlug: string
}

type OverrideRequest = {
  action: ClockAction
  employeeKey: string
}

function ManagerTimeClockPage({
  date,
  initialData,
  organizationId,
  locationId,
  userId,
  workspaceSlug,
}: ManagerTimeClockPageProps) {
  const input = { date, organizationId, locationId, userId }
  const query = useManagerClockQuery(input)
  const data = query.data ?? initialData
  const { approveAsRecordedMutation, overrideMutation } =
    useManagerClockMutations(input)
  const liveNow = useLiveNow(
    data.employees.some((employee) => employee.openEntry)
  )
  const stats = getManagerClockStats(data, liveNow)
  const [isOverrideOpen, setIsOverrideOpen] = React.useState(false)
  const [overrideRequest, setOverrideRequest] = React.useState<OverrideRequest>(
    { action: "clock_in", employeeKey: "" }
  )

  function openOverride(action: ClockAction, employee?: ManagerClockEmployee) {
    setOverrideRequest({
      action,
      employeeKey: employee ? getManagerClockEmployeeKey(employee) : "",
    })
    setIsOverrideOpen(true)
  }

  return (
    <>
      <TimeClockDashboard
        data={data}
        isApproving={approveAsRecordedMutation.isPending}
        isRefreshing={query.isFetching}
        liveNow={liveNow}
        onApprove={(entryId) => approveAsRecordedMutation.mutate({ entryId })}
        onManualAction={openOverride}
        onRefresh={() => void query.refetch()}
        stats={stats}
        workspaceSlug={workspaceSlug}
      />
      <ManagerClockOverrideDialog
        employees={data.employees.filter((employee) =>
          data.writableLocationIds.includes(employee.locationId)
        )}
        initialAction={overrideRequest.action}
        initialEmployeeKey={overrideRequest.employeeKey}
        isPending={overrideMutation.isPending}
        onOpenChange={setIsOverrideOpen}
        onSubmit={({ action, employee, reason }) => {
          overrideMutation.mutate(
            {
              action,
              employeeId: employee.id,
              locationId: employee.locationId,
              reason,
            },
            { onSuccess: () => setIsOverrideOpen(false) }
          )
        }}
        open={isOverrideOpen}
      />
    </>
  )
}

export { ManagerTimeClockPage }
