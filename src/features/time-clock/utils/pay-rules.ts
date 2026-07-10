type ClockPayRuleSettings = {
  earlyClockInGraceMinutes: number
  earlyStartReviewMinutes: number
  forgottenClockOutAlertMinutes: number
  hardReviewAfterMinutes: number
  lateClockInGraceMinutes: number
  lateClockOutGraceMinutes: number
  lateFinishReviewMinutes: number
  lateStartReviewMinutes: number
}

type ScheduledClockWindow = {
  startsAt: Date
  endsAt: Date
}

type PayableClockInResult = {
  payableStartAt: Date
  reviewReason: string | null
}

type PayableClockOutResult = {
  payableEndAt: Date
  reviewReason: string | null
}

const MINUTE_MS = 60 * 1000

function getPayableClockIn(input: {
  actualClockInAt: Date
  rules: ClockPayRuleSettings
  scheduledWindow: ScheduledClockWindow | null
}): PayableClockInResult {
  if (!input.scheduledWindow) {
    return {
      payableStartAt: input.actualClockInAt,
      reviewReason: "Clock-in did not match a published shift.",
    }
  }

  const earlyByMinutes = getMinutesBetween(
    input.actualClockInAt,
    input.scheduledWindow.startsAt,
  )

  if (earlyByMinutes <= 0) {
    return {
      payableStartAt: input.actualClockInAt,
      reviewReason: null,
    }
  }

  const isWithinGrace =
    earlyByMinutes <= input.rules.earlyClockInGraceMinutes

  return {
    payableStartAt: isWithinGrace
      ? input.actualClockInAt
      : input.scheduledWindow.startsAt,
    reviewReason:
      earlyByMinutes > input.rules.earlyStartReviewMinutes
        ? `Clocked in ${Math.round(earlyByMinutes)} minutes before scheduled start.`
        : null,
  }
}

function getPayableClockOut(input: {
  actualClockOutAt: Date
  rules: ClockPayRuleSettings
  scheduledWindow: ScheduledClockWindow | null
}): PayableClockOutResult {
  if (!input.scheduledWindow) {
    return {
      payableEndAt: input.actualClockOutAt,
      reviewReason: null,
    }
  }

  const lateByMinutes = getMinutesBetween(
    input.scheduledWindow.endsAt,
    input.actualClockOutAt,
  )

  if (lateByMinutes <= 0) {
    return {
      payableEndAt: input.actualClockOutAt,
      reviewReason: null,
    }
  }

  const isWithinGrace =
    lateByMinutes <= input.rules.lateClockOutGraceMinutes
  const needsLateReview =
    lateByMinutes > input.rules.lateFinishReviewMinutes
  const needsForgottenReview =
    lateByMinutes > input.rules.hardReviewAfterMinutes

  return {
    payableEndAt: isWithinGrace
      ? input.actualClockOutAt
      : input.scheduledWindow.endsAt,
    reviewReason: needsForgottenReview
      ? `Possible forgotten clock-out: ended ${Math.round(lateByMinutes)} minutes after scheduled finish.`
      : needsLateReview
        ? `Clocked out ${Math.round(lateByMinutes)} minutes after scheduled finish.`
        : null,
  }
}

function isPastForgottenClockOutAlert(input: {
  now: Date
  rules: ClockPayRuleSettings
  scheduledEndAt: Date | null
}) {
  if (!input.scheduledEndAt) {
    return false
  }

  return (
    getMinutesBetween(input.scheduledEndAt, input.now) >
    input.rules.forgottenClockOutAlertMinutes
  )
}

function getMinutesBetween(first: Date, second: Date) {
  return (second.getTime() - first.getTime()) / MINUTE_MS
}

export {
  getPayableClockIn,
  getPayableClockOut,
  isPastForgottenClockOutAlert,
}
export type {
  ClockPayRuleSettings,
  PayableClockInResult,
  PayableClockOutResult,
  ScheduledClockWindow,
}
