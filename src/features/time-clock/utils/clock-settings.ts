import type {
  ClockSettingsLocation,
  ClockSettingsValues,
} from "@/features/time-clock/types"

function getClockSettingsValues(
  location: ClockSettingsLocation
): ClockSettingsValues {
  return {
    earlyClockInGraceMinutes: location.earlyClockInGraceMinutes,
    earlyStartReviewMinutes: location.earlyStartReviewMinutes,
    forgottenClockOutAlertMinutes: location.forgottenClockOutAlertMinutes,
    hardReviewAfterMinutes: location.hardReviewAfterMinutes,
    unscheduledClockOutAfterMinutes: location.unscheduledClockOutAfterMinutes,
    unscheduledClockOutReminderMinutes:
      location.unscheduledClockOutReminderMinutes,
    isEnabled: location.isEnabled,
    lateClockInGraceMinutes: location.lateClockInGraceMinutes,
    lateClockOutGraceMinutes: location.lateClockOutGraceMinutes,
    lateFinishReviewMinutes: location.lateFinishReviewMinutes,
    lateStartReviewMinutes: location.lateStartReviewMinutes,
    latitude: location.latitude,
    longitude: location.longitude,
    maxAccuracyMeters: location.maxAccuracyMeters,
    radiusMeters: location.radiusMeters,
    timezone: location.timezone,
  }
}

function normalizeClockSettingsValues(
  current: ClockSettingsValues,
  patch: Partial<ClockSettingsValues>
): ClockSettingsValues {
  const next = { ...current, ...patch }

  return {
    ...next,
    earlyStartReviewMinutes: Math.max(
      next.earlyClockInGraceMinutes,
      next.earlyStartReviewMinutes
    ),
    hardReviewAfterMinutes: Math.max(
      next.forgottenClockOutAlertMinutes + 1,
      next.hardReviewAfterMinutes
    ),
    unscheduledClockOutAfterMinutes: Math.max(
      next.unscheduledClockOutReminderMinutes + 1,
      next.unscheduledClockOutAfterMinutes
    ),
    lateFinishReviewMinutes: Math.max(
      next.lateClockOutGraceMinutes,
      next.lateFinishReviewMinutes
    ),
    lateStartReviewMinutes: Math.max(
      next.lateClockInGraceMinutes,
      next.lateStartReviewMinutes
    ),
  }
}

export { getClockSettingsValues, normalizeClockSettingsValues }
