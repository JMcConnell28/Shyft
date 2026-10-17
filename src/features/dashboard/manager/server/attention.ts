import "@tanstack/react-start/server-only"

import { z } from "zod"
import { resolveManagerDashboardAccess } from "./access"
import { dashboardAttentionSql } from "./attention-sql"
import { segmentSchema, timestampSchema } from "./record-schemas"
import type { AttentionPage } from "../types"
import { getDatabase } from "@/lib/db"

const ATTENTION_PAGE_SIZE = 8
const issueSchema = z.object({
  id: z.string(),
  kind: z.enum(["review", "missing_clock_out", "arrival", "swap", "cover"]),
  employee_id: z.string(),
  employee_name: z.string(),
  location_id: z.string(),
  location_name: z.string(),
  time_zone: z.string(),
  occurred_at: timestampSchema,
  clocked_out_at: timestampSchema.nullable(),
  work_date: z.string(),
  reason: z.string(),
  segment: segmentSchema,
  assignment_id: z.string().nullable(),
})
const pageSchema = z.object({
  total: z.number().int().nonnegative(),
  items: z.array(issueSchema),
})

async function getManagerDashboardAttention(input: {
  organizationId: string
  page: number
}): Promise<AttentionPage> {
  const access = await resolveManagerDashboardAccess(input.organizationId)
  const attendanceIds = access.locations
    .filter((item) => item.attendanceEnabled)
    .map((item) => item.id)
  const now = new Date()
  const result = await getDatabase().query(dashboardAttentionSql, [
    input.organizationId,
    attendanceIds,
    access.locations.map((item) => item.id),
    now.toISOString(),
    ATTENTION_PAGE_SIZE,
    input.page,
    access.capabilities.canUpdateRota,
  ])
  const row = pageSchema.parse(result.rows[0])
  return {
    total: row.total,
    page: Math.min(
      input.page,
      Math.max(1, Math.ceil(row.total / ATTENTION_PAGE_SIZE))
    ),
    pageSize: ATTENTION_PAGE_SIZE,
    updatedAt: now.toISOString(),
    items: row.items.map((item) => ({
      id: item.id,
      kind: item.kind,
      employeeId: item.employee_id,
      employeeName: item.employee_name,
      locationId: item.location_id,
      locationName: item.location_name,
      timeZone: item.time_zone,
      occurredAt: item.occurred_at,
      reason: item.reason,
      segment: item.segment,
      assignmentId: item.assignment_id,
      clockedOutAt: item.clocked_out_at,
      workDate: item.work_date,
    })),
  }
}
export { getManagerDashboardAttention }
