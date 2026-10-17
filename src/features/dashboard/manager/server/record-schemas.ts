import { z } from "zod"

const timestampSchema = z
  .union([z.string(), z.date()])
  .pipe(z.coerce.date())
  .transform((date) => date.toISOString())
const segmentSchema = z.enum(["full", "split_first", "split_second"])
const scheduleRowSchema = z.object({
  employee_status: z.string(),
  day_date: z.string(),
  assignment_id: z.string(),
  employee_id: z.string(),
  employee_name: z.string(),
  shift_id: z.string(),
  rota_id: z.string(),
  zone: z.string(),
  segment: segmentSchema,
  starts_at: timestampSchema,
  ends_at: timestampSchema,
  is_closing: z.boolean(),
  resolution_reason: z.string().nullable(),
})
const attendanceRowSchema = z.object({
  employee_status: z.string(),
  id: z.string(),
  employee_id: z.string(),
  employee_name: z.string(),
  rota_published_shift_id: z.string().nullable(),
  shift_segment: segmentSchema,
  clocked_in_at: timestampSchema,
  clocked_out_at: timestampSchema.nullable(),
  scheduled_end_at: timestampSchema.nullable(),
  source: z.enum(["employee_nfc", "manager_override", "adjustment"]),
  status: z.enum(["open", "closed", "requires_review"]),
  notes: z.string().nullable(),
  zone: z.string().nullable(),
  rota_id: z.string().nullable(),
})
const planningRowSchema = z.object({
  week_start: z.string(),
  rota_id: z.string().nullable(),
  status: z.enum(["draft", "published", "not_started"]),
  has_changes: z.boolean(),
  unfilled: z.number(),
})
type ScheduleRow = z.infer<typeof scheduleRowSchema>
type AttendanceRow = z.infer<typeof attendanceRowSchema>

export {
  timestampSchema,
  segmentSchema,
  scheduleRowSchema,
  attendanceRowSchema,
  planningRowSchema,
}
export type { ScheduleRow, AttendanceRow }
