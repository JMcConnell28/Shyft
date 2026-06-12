import { z } from "zod"

import type {
  CreateWorkspaceShiftInput,
  WorkspaceDay,
  WorkspaceLocation,
} from "@/features/rota/types/workspace"
import { shiftTimePattern } from "@/features/rota/utils/shift-time"
import {
  getTimeMinutes,
  getWeekdayCloseTime,
  normalizeShiftEnd,
} from "@/features/rota/utils/workspace-shifts"

const timeFieldSchema = z
  .string()
  .regex(shiftTimePattern, "Choose a valid time.")

const createShiftFormSchema = z
  .object({
    dayId: z.string().min(1, "Choose a day."),
    zoneId: z.string().min(1, "Choose a zone."),
    shiftType: z.enum(["standard", "split"]),
    useCloseTime: z.boolean(),
    startTime: timeFieldSchema,
    endTime: timeFieldSchema,
    splitStartTime: timeFieldSchema,
    splitEndTime: timeFieldSchema,
    splitSecondStartTime: timeFieldSchema,
    splitSecondEndTime: timeFieldSchema,
  })
  .superRefine((value, context) => {
    if (
      value.shiftType === "standard" &&
      !value.useCloseTime &&
      !hasPositiveShiftDuration(value.startTime, value.endTime)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Finish time must be different from the start time.",
        path: ["endTime"],
      })
    }

    if (value.shiftType === "standard" && value.useCloseTime) {
      if (!value.dayId) {
        return
      }
    }

    if (value.shiftType !== "split") {
      return
    }

    if (!hasPositiveShiftDuration(value.splitStartTime, value.splitEndTime)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Segment 1 must finish after it starts.",
        path: ["splitEndTime"],
      })
    }

    if (
      !hasPositiveShiftDuration(
        value.splitSecondStartTime,
        value.useCloseTime
          ? getClosingTimeForForm(value.dayId, { days: [], location: null })
          : value.splitSecondEndTime
      )
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Segment 2 must finish after it starts.",
        path: ["splitSecondEndTime"],
      })
    }

    if (
      hasPositiveShiftDuration(value.splitStartTime, value.splitEndTime) &&
      !hasSplitGap({
        firstEndTime: value.splitEndTime,
        secondStartTime: value.splitSecondStartTime,
      })
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Split shifts need a real gap between both segments.",
        path: ["splitSecondStartTime"],
      })
    }
  })

function parseCreateShiftInput(
  value: CreateShiftFormSchema,
  options: {
    days: WorkspaceDay[]
    location: WorkspaceLocation | null
  }
): CreateWorkspaceShiftInput {
  const parsedValue = createShiftFormSchema.parse(value)

  if (parsedValue.shiftType === "standard") {
    if (parsedValue.useCloseTime) {
      const closeTime = getClosingTimeForForm(parsedValue.dayId, options)

      if (!hasPositiveShiftDuration(parsedValue.startTime, closeTime)) {
        throw new Error("Closing shifts must start before the selected closing time.")
      }

      return {
        dayId: parsedValue.dayId,
        zoneId: parsedValue.zoneId,
        shiftType: "closing",
        startTime: parsedValue.startTime,
        endKind: "locationClose",
      }
    }

    return {
      dayId: parsedValue.dayId,
      zoneId: parsedValue.zoneId,
      shiftType: "standard",
      startTime: parsedValue.startTime,
      endTime: parsedValue.endTime,
    }
  }

  if (parsedValue.useCloseTime) {
    const closeTime = getClosingTimeForForm(parsedValue.dayId, options)

    if (!hasPositiveShiftDuration(parsedValue.splitSecondStartTime, closeTime)) {
      throw new Error("The second segment must start before closing time.")
    }

    return {
      dayId: parsedValue.dayId,
      zoneId: parsedValue.zoneId,
      shiftType: "split",
      segments: [
        {
          startTime: parsedValue.splitStartTime,
          endTime: parsedValue.splitEndTime,
        },
        {
          startTime: parsedValue.splitSecondStartTime,
          endKind: "locationClose",
        },
      ],
    }
  }

  return {
    dayId: parsedValue.dayId,
    zoneId: parsedValue.zoneId,
    shiftType: "split",
    segments: [
      {
        startTime: parsedValue.splitStartTime,
        endTime: parsedValue.splitEndTime,
      },
      {
        startTime: parsedValue.splitSecondStartTime,
        endTime: parsedValue.splitSecondEndTime,
      },
    ],
  }
}

function getClosingShiftFieldError(
  value: Pick<
    CreateShiftFormSchema,
    "dayId" | "shiftType" | "startTime" | "useCloseTime"
  >,
  options: {
    days: WorkspaceDay[]
    location: WorkspaceLocation | null
  }
) {
  if (value.shiftType !== "standard" || !value.useCloseTime || !value.dayId) {
    return null
  }

  const closeTime = getClosingTimeForForm(value.dayId, options)

  if (!hasPositiveShiftDuration(value.startTime, closeTime)) {
    return "Closing shifts must start before the selected closing time."
  }

  return null
}

function getClosingTimeForForm(
  dayId: string,
  options: {
    days: WorkspaceDay[]
    location: WorkspaceLocation | null
  }
) {
  const day = options.days.find((entry) => entry.id === dayId)

  if (!day || !options.location) {
    return "23:00"
  }

  return getWeekdayCloseTime(options.location, day.id)
}

function hasPositiveShiftDuration(startTime: string, endTime: string) {
  return normalizeShiftEnd(startTime, endTime) > getTimeMinutes(startTime)
}

function hasSplitGap({
  firstEndTime,
  secondStartTime,
}: {
  firstEndTime: string
  secondStartTime: string
}) {
  return getTimeMinutes(secondStartTime) > getTimeMinutes(firstEndTime)
}

type CreateShiftFormSchema = z.infer<typeof createShiftFormSchema>

export {
  createShiftFormSchema,
  getClosingShiftFieldError,
  parseCreateShiftInput,
}
export type { CreateShiftFormSchema }
