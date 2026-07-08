import "@tanstack/react-start/server-only"

import { syncBillingAccountAfterCoverageChange } from "@/features/billing/server/subscriptions"
import { getDatabase } from "@/lib/db"

type DueTransferRow = {
  id: string
  location_id: string
  source_billing_account_id: string
  target_billing_account_id: string
}

async function processDueBillingTransfers(sourceBillingAccountId: string) {
  const result = await getDatabase().query<DueTransferRow>(
    `select transfer.id,
            transfer.location_id,
            transfer.source_billing_account_id,
            transfer.target_billing_account_id
     from billing_private.billing_transfers transfer
     join public.billing_accounts target
       on target.id = transfer.target_billing_account_id
     where transfer.source_billing_account_id = $1
       and transfer.status in ('scheduled', 'ready')
       and transfer.effective_at <= timezone('utc', now())
       and target.stripe_payment_method_id is not null
     order by transfer.effective_at
     for update of transfer`,
    [sourceBillingAccountId]
  )

  for (const transfer of result.rows) {
    const client = await getDatabase().connect()

    try {
      await client.query("BEGIN")
      await client.query(
        `update public.locations
         set billing_account_id = $2,
             updated_at = timezone('utc', now())
         where id = $1
           and billing_account_id = $3`,
        [
          transfer.location_id,
          transfer.target_billing_account_id,
          transfer.source_billing_account_id,
        ]
      )
      await client.query(
        `update billing_private.billing_transfers
         set status = 'completed',
             completed_at = timezone('utc', now()),
             updated_at = timezone('utc', now())
         where id = $1`,
        [transfer.id]
      )
      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }

    await syncBillingAccountAfterCoverageChange(
      transfer.source_billing_account_id
    )
    await syncBillingAccountAfterCoverageChange(
      transfer.target_billing_account_id
    )
  }

  return result.rowCount ?? 0
}

export { processDueBillingTransfers }
