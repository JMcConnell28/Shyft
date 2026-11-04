import "@tanstack/react-start/server-only"
import { z } from "zod"

import { getDatabase } from "./index"

const timestampSchema = z
  .date()
  .nullable()
  .transform((value) => value?.toISOString() ?? null)
const billingReconciliationHealthSchema = z.object({
  hasCustomers: z.boolean(),
  lastStatus: z.enum(["running", "completed", "failed"]).nullable(),
  lastStartedAt: timestampSchema,
  lastFinishedAt: timestampSchema,
  lastSuccessfulAt: timestampSchema,
  needsAttention: z.boolean(),
})
type BillingReconciliationHealth = z.output<
  typeof billingReconciliationHealthSchema
>

async function getBillingReconciliationHealth(): Promise<BillingReconciliationHealth> {
  const result = await getDatabase().query(`with latest as (
      select status, started_at, finished_at from public.billing_reconciliation_runs order by started_at desc limit 1
    ), success as (select max(finished_at) as finished_at from public.billing_reconciliation_runs where status = 'completed'),
    customers as (select exists(select 1 from public.billing_accounts where stripe_customer_id is not null) as present)
    select customers.present as "hasCustomers", (select status from latest) as "lastStatus",
      (select started_at from latest) as "lastStartedAt", (select finished_at from latest) as "lastFinishedAt",
      success.finished_at as "lastSuccessfulAt",
      (customers.present and (success.finished_at is null or success.finished_at < now() - interval '26 hours'
        or coalesce((select status = 'failed' or (status = 'running' and started_at < now() - interval '1 hour') from latest), false))) as "needsAttention"
    from customers cross join success`)
  return billingReconciliationHealthSchema.parse(result.rows[0])
}

export { getBillingReconciliationHealth }
export type { BillingReconciliationHealth }
