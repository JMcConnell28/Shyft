import { z } from "zod"

const telemetryContextSchema = z.object({
  locationId: z.uuid().nullable().optional(),
  organizationId: z.string().nullable().optional(),
  routePath: z.string().max(300).nullable().optional(),
  userId: z.string().nullable().optional(),
})

const captureAppErrorSchema = telemetryContextSchema.extend({
  message: z.string().trim().min(1).max(2000),
  metadata: z.record(z.string(), z.unknown()).optional(),
  severity: z.enum(["info", "warning", "error", "fatal"]).default("error"),
  source: z.enum(["client", "server"]).default("client"),
  stack: z.string().max(12000).nullable().optional(),
  userAgent: z.string().max(1000).nullable().optional(),
})

const captureAppEventSchema = telemetryContextSchema.extend({
  eventType: z.string().trim().min(2).max(120),
  metadata: z.record(z.string(), z.unknown()).optional(),
  targetId: z.string().nullable().optional(),
  targetType: z.string().max(80).nullable().optional(),
})

export { captureAppErrorSchema, captureAppEventSchema }
