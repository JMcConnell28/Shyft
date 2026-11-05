import type { WorkspaceBillingState } from "@/features/billing/types"

function needsTimeAttendanceSetup(
  billing: Pick<WorkspaceBillingState, "locations"> | null,
  allowStationActivation = false
): boolean {
  return Boolean(
    billing &&
    billing.locations.length > 0 &&
    billing.locations.every(
      (location) =>
        !location.timeAttendanceEnabled &&
        (!allowStationActivation || location.hardwareEntitlementAvailable)
    )
  )
}

export { needsTimeAttendanceSetup }
