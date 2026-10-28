import { z } from "zod"

import type { RotaPdfDocumentData } from "@/features/rota/types/rota-pdf"

const rotaPdfDocumentDataSchema: z.ZodType<RotaPdfDocumentData> = z.object({
  fileName: z.string(),
  versionLabel: z.string(),
  generatedAtLabel: z.string(),
  brandLogoUrl: z.string().nullable(),
  locationName: z.string(),
  note: z.string().nullable(),
  options: z.object({
    visibleStats: z.array(
      z.enum(["scheduledHours", "labourCost", "shiftCount"])
    ),
  }),
  weekLabel: z.string(),
  pages: z.array(
    z.object({
      zoneId: z.string(),
      zoneName: z.string(),
      totalCostLabel: z.string(),
      totalHoursLabel: z.string(),
      totalShiftCount: z.number().int().nonnegative(),
      days: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          dateLabel: z.string(),
          shifts: z.array(
            z.object({
              id: z.string(),
              timeLines: z.array(z.string()),
              employees: z.array(
                z.object({
                  badgeText: z.string(),
                  id: z.string(),
                  name: z.string(),
                  groupId: z.string(),
                  groupName: z.string(),
                  groupColorHex: z.string(),
                })
              ),
            })
          ),
        })
      ),
      legend: z.array(
        z.object({
          badgeText: z.string(),
          id: z.string(),
          name: z.string(),
          colorHex: z.string(),
        })
      ),
    })
  ),
})

export const rotaPdfWorkerRequestSchema = z.object({
  type: z.literal("render"),
  data: rotaPdfDocumentDataSchema,
})

export const rotaPdfWorkerResponseSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("complete"), blob: z.instanceof(Blob) }),
  z.object({ type: z.literal("error"), message: z.string() }),
])
