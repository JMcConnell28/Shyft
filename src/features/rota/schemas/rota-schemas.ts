import { addDays, format, isValid, parseISO, startOfWeek } from "date-fns"
import { z } from "zod"

import { organizationSlugSchema } from "@/features/onboarding/schemas/onboarding-schemas"

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

const locationSlugSchema = z
  .string()
  .trim()
  .min(2, "Choose a location.")
  .max(48, "Location slug is too long.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens only."
  )

const isoDateSchema = z
  .string()
  .trim()
  .regex(isoDatePattern, "Choose a valid date.")
  .refine((value) => normalizeOptionalIsoDate(value) !== undefined, {
    message: "Choose a valid date.",
  })

const rotaStatusSchema = z.enum(["draft", "published"])
const rotaStatusFilterSchema = z.enum(["all", "draft", "published"])
const rotaRangeFilterSchema = z.enum([
  "all",
  "this-week",
  "next-4-weeks",
  "past-4-weeks",
  "custom",
])
const newRotaSourceSchema = z.enum(["blank", "previous-week", "template"])
const rotaPageSizeValues = [10, 20, 50] as const
const rotaPageSizeSchema = z.union([
  z.literal(10),
  z.literal(20),
  z.literal(50),
])

const createRotaDialogSchema = z
  .object({
    locationId: z.string().uuid("Choose a location."),
    weekStart: isoDateSchema,
    sourceType: newRotaSourceSchema,
    templateId: z.string().uuid("Choose a template.").optional().nullable(),
  })
  .superRefine((value, context) => {
    if (value.sourceType === "template" && !value.templateId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["templateId"],
        message: "Choose a template.",
      })
    }
  })

const previewRotaCreationSchema = z.object({
  locationId: z.string().uuid("Choose a location."),
  weekStart: isoDateSchema,
})

const duplicateRotaSchema = z.object({
  rotaId: z.string().uuid("Choose a rota."),
})

const publishRotaSchema = z.object({
  rotaId: z.string().uuid("Choose a rota."),
})

const unpublishRotaSchema = z.object({
  rotaId: z.string().uuid("Choose a rota."),
})

const deleteDraftRotaSchema = z.object({
  rotaId: z.string().uuid("Choose a rota."),
})

const updateRotaNoteSchema = z.object({
  rotaId: z.string().uuid("Choose a rota."),
  note: z
    .string()
    .trim()
    .max(500, "Keep notes under 500 characters.")
    .optional()
    .default(""),
})

const updateRotaBudgetSchema = z.object({
  rotaId: z.string().uuid("Choose a rota."),
  budgetPence: z
    .number()
    .int()
    .min(0, "Enter a budget of zero or more.")
    .max(100_000_000, "Enter a budget below £1,000,000.")
    .nullable(),
})

const rotaRouteParamsSchema = z.object({
  orgSlug: organizationSlugSchema,
  locationSlug: locationSlugSchema,
  rotaId: z.uuid(),
})

const rawRotaListSearchSchema = z.object({
  location: z.string().trim().optional(),
  status: z.string().trim().optional(),
  range: z.string().trim().optional(),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
  page: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      const nextValue =
        typeof value === "number" ? value : Number.parseInt(value ?? "", 10)
      return Number.isFinite(nextValue) ? nextValue : 1
    }),
  pageSize: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => {
      const nextValue =
        typeof value === "number" ? value : Number.parseInt(value ?? "", 10)
      return Number.isFinite(nextValue) ? nextValue : 20
    }),
})

type RotaStatus = z.infer<typeof rotaStatusSchema>
type RotaStatusFilter = z.infer<typeof rotaStatusFilterSchema>
type RotaRangeFilter = z.infer<typeof rotaRangeFilterSchema>
type NewRotaSource = z.infer<typeof newRotaSourceSchema>
type RotaPageSize = (typeof rotaPageSizeValues)[number]

type RotaListSearch = {
  location?: string
  status: RotaStatusFilter
  range: RotaRangeFilter
  from?: string
  to?: string
  page: number
  pageSize: RotaPageSize
}

function normalizeOptionalIsoDate(value: string | null | undefined) {
  if (!value) {
    return undefined
  }

  if (!isoDatePattern.test(value)) {
    return undefined
  }

  const parsed = parseISO(value)

  if (!isValid(parsed)) {
    return undefined
  }

  return format(parsed, "yyyy-MM-dd")
}

function normalizeWeekStart(value: Date | string) {
  const parsed = value instanceof Date ? value : parseISO(value)
  const weekStart = startOfWeek(parsed, { weekStartsOn: 1 })
  return format(weekStart, "yyyy-MM-dd")
}

function toIsoDate(value: Date | string) {
  const parsed = value instanceof Date ? value : parseISO(value)
  return format(parsed, "yyyy-MM-dd")
}

function getWeekRangeFromStart(weekStart: Date | string) {
  const start = weekStart instanceof Date ? weekStart : parseISO(weekStart)
  const normalizedStart = startOfWeek(start, { weekStartsOn: 1 })
  const end = addDays(normalizedStart, 6)

  return {
    start: normalizedStart,
    end,
    startLabel: format(normalizedStart, "d MMM"),
    endLabel: format(end, "d MMM yyyy"),
    summaryLabel: `${format(normalizedStart, "d MMM")} - ${format(
      end,
      "d MMM yyyy"
    )}`,
  }
}

function parseRotaListSearch(search: Record<string, unknown>): RotaListSearch {
  const parsed = rawRotaListSearchSchema.parse(search)
  const normalizedStatus = rotaStatusFilterSchema.safeParse(parsed.status)
  const normalizedRange = rotaRangeFilterSchema.safeParse(parsed.range)
  const normalizedLocation = locationSlugSchema.safeParse(parsed.location)
  const normalizedPage = Math.max(1, Math.trunc(parsed.page))
  const normalizedPageSize = rotaPageSizeSchema.safeParse(parsed.pageSize)
  const normalizedFrom = normalizeOptionalIsoDate(parsed.from)
  const normalizedTo = normalizeOptionalIsoDate(parsed.to)

  const range =
    normalizedRange.success &&
    (normalizedFrom || normalizedTo || parsed.range !== "custom")
      ? normalizedRange.data
      : parsed.range === "custom"
        ? "next-4-weeks"
        : normalizedRange.success
          ? normalizedRange.data
          : "all"

  return {
    location: normalizedLocation.success ? normalizedLocation.data : undefined,
    status: normalizedStatus.success ? normalizedStatus.data : "all",
    range,
    from: range === "custom" ? normalizedFrom : undefined,
    to: range === "custom" ? normalizedTo : undefined,
    page: normalizedPage,
    pageSize: normalizedPageSize.success ? normalizedPageSize.data : 20,
  }
}

export type {
  NewRotaSource,
  RotaListSearch,
  RotaPageSize,
  RotaRangeFilter,
  RotaStatus,
  RotaStatusFilter,
}
export {
  createRotaDialogSchema,
  duplicateRotaSchema,
  getWeekRangeFromStart,
  isoDateSchema,
  locationSlugSchema,
  newRotaSourceSchema,
  normalizeOptionalIsoDate,
  normalizeWeekStart,
  parseRotaListSearch,
  deleteDraftRotaSchema,
  previewRotaCreationSchema,
  publishRotaSchema,
  rawRotaListSearchSchema,
  rotaPageSizeSchema,
  rotaPageSizeValues,
  rotaRangeFilterSchema,
  rotaRouteParamsSchema,
  rotaStatusFilterSchema,
  rotaStatusSchema,
  toIsoDate,
  unpublishRotaSchema,
  updateRotaNoteSchema,
  updateRotaBudgetSchema,
}
