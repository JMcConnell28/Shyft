import { Suspense, lazy } from "react"
import type { ManagerDashboardAccess } from "../types"
import type { useDashboardActions } from "../hooks/use-dashboard-actions"
import { getManagerClockEmployeeKey } from "@/features/time-clock/utils/manager-clock-employees"

const ClockDialog = lazy(() =>
  import("@/features/time-clock/components/manager-clock-override-dialog").then(
    (module) => ({ default: module.ManagerClockOverrideDialog })
  )
)
const ArrivalDialog = lazy(() =>
  import("./arrival-resolution-dialog").then((module) => ({
    default: module.ArrivalResolutionDialog,
  }))
)
const ReviewDialog = lazy(() =>
  import("./time-review-dialog").then((module) => ({
    default: module.DashboardTimeReviewDialog,
  }))
)

function ManagerDashboardDialogs({
  actions,
  access,
  organizationId,
  workspaceSlug,
}: {
  actions: ReturnType<typeof useDashboardActions>
  access: ManagerDashboardAccess
  organizationId: string
  workspaceSlug: string
}) {
  const { request, setRequest, arrival, clock } = actions
  if (!request) return null
  const close = () => setRequest(null)
  if (request.kind === "clock")
    return (
      <Suspense fallback={null}>
        <ClockDialog
          open
          employees={[request.employee]}
          initialAction={request.action}
          initialEmployeeKey={getManagerClockEmployeeKey(request.employee)}
          isPending={clock.overrideMutation.isPending}
          onOpenChange={(open) => {
            if (!open) close()
          }}
          onSubmit={({ action, employee, reason }) =>
            clock.overrideMutation.mutate(
              {
                action,
                shiftSegment: request.segment,
                employeeId: employee.id,
                locationId: employee.locationId,
                reason,
              },
              { onSuccess: close }
            )
          }
        />
      </Suspense>
    )
  const location = access.locations.find(
    (item) => item.id === request.item.locationId
  )
  const canWrite = Boolean(location?.canWrite && location.attendanceEnabled)
  if (request.kind === "arrival")
    return (
      <Suspense fallback={null}>
        <ArrivalDialog
          key={request.item.id}
          item={request.item}
          pending={arrival.isPending}
          canResolve={canWrite}
          onClose={close}
          onResolve={(reason) => {
            if (!request.item.assignmentId) return
            arrival.mutate({
              organizationId,
              locationId: request.item.locationId,
              assignmentId: request.item.assignmentId,
              segment: request.item.segment,
              scheduledStartAt: request.item.occurredAt,
              reason,
            })
          }}
        />
      </Suspense>
    )
  return (
    <Suspense fallback={null}>
      <ReviewDialog
        item={request.item}
        workspaceSlug={workspaceSlug}
        canApprove={canWrite}
        pending={clock.approveAsRecordedMutation.isPending}
        onClose={close}
        onApprove={() =>
          clock.approveAsRecordedMutation.mutate(
            { entryId: request.item.id },
            { onSuccess: close }
          )
        }
      />
    </Suspense>
  )
}
export { ManagerDashboardDialogs }
