import "@tanstack/react-start/server-only"

import {
  refreshStripeSubscriptionsForBillingAccount,
  syncBillingSubscriptionQuantities,
} from "@/features/billing/server/subscriptions"
import { getDatabase } from "@/lib/db"
import { processDueAddonCancellations } from "@/features/billing/server/addons"
import {
  finalizeEndedBillingPeriods,
  submitEmployeeOverageMeter,
} from "@/features/billing/server/usage"
import { processDueBillingTransfers } from "@/features/billing/server/transfers"

type BillingReconciliationAccountRow = {
  id: string
  stripe_customer_id: string
}

type BillingReconciliationAccountResult = {
  billingAccountId: string
  errorMessage: string | null
  stripeCustomerId: string
  subscriptionCount: number
  quantitySynced: boolean
  status: "synced" | "failed"
}

type BillingReconciliationResult = {
  runId: string
  checkedAccountCount: number
  syncedSubscriptionCount: number
  syncedQuantityCount: number
  failedAccountCount: number
  accounts: Array<BillingReconciliationAccountResult>
}

async function listBillingAccountsForReconciliation() {
  const result = await getDatabase().query<BillingReconciliationAccountRow>(
    `select id,
            stripe_customer_id
     from public.billing_accounts
     where stripe_customer_id is not null
     order by created_at asc`
  )

  return result.rows
}

async function createBillingReconciliationRun() {
  const result = await getDatabase().query<{ id: string }>(
    `insert into public.billing_reconciliation_runs (status)
     values ('running')
     returning id`
  )
  const runId = result.rows.at(0)?.id

  if (!runId) {
    throw new Error("Could not create billing reconciliation run.")
  }

  return runId
}

async function updateBillingReconciliationRun(input: {
  runId: string
  result: Omit<BillingReconciliationResult, "runId">
}) {
  const status = input.result.failedAccountCount > 0 ? "failed" : "completed"
  const errorMessage =
    input.result.failedAccountCount > 0
      ? `${input.result.failedAccountCount} billing account reconciliation failed.`
      : null

  await getDatabase().query(
    `update public.billing_reconciliation_runs
     set status = $2,
         checked_account_count = $3,
         synced_subscription_count = $4,
         synced_quantity_count = $5,
         failed_account_count = $6,
         error_message = $7,
         finished_at = timezone('utc', now()),
         updated_at = timezone('utc', now())
     where id = $1`,
    [
      input.runId,
      status,
      input.result.checkedAccountCount,
      input.result.syncedSubscriptionCount,
      input.result.syncedQuantityCount,
      input.result.failedAccountCount,
      errorMessage,
    ]
  )
}

async function failBillingReconciliationRun(input: {
  runId: string
  error: unknown
}) {
  const errorMessage =
    input.error instanceof Error
      ? input.error.message
      : "Billing reconciliation failed."

  await getDatabase().query(
    `update public.billing_reconciliation_runs
     set status = 'failed',
         error_message = left($2, 1000),
         finished_at = timezone('utc', now()),
         updated_at = timezone('utc', now())
     where id = $1`,
    [input.runId, errorMessage]
  )
}

async function reconcileBillingAccount(
  account: BillingReconciliationAccountRow
): Promise<BillingReconciliationAccountResult> {
  try {
    const subscriptions = await refreshStripeSubscriptionsForBillingAccount({
      billingAccountId: account.id,
      stripeCustomerId: account.stripe_customer_id,
    })
    await finalizeEndedBillingPeriods(account.id)
    await processDueAddonCancellations(account.id)
    await processDueBillingTransfers(account.id)
    const syncedQuantitySubscription = await syncBillingSubscriptionQuantities(
      account.id
    )
    const syncedUsage = await submitEmployeeOverageMeter(account.id)

    return {
      billingAccountId: account.id,
      errorMessage: null,
      stripeCustomerId: account.stripe_customer_id,
      subscriptionCount: subscriptions.length,
      quantitySynced: Boolean(syncedQuantitySubscription) || syncedUsage,
      status: "synced",
    }
  } catch (error) {
    return {
      billingAccountId: account.id,
      errorMessage:
        error instanceof Error ? error.message : "Billing account sync failed.",
      stripeCustomerId: account.stripe_customer_id,
      subscriptionCount: 0,
      quantitySynced: false,
      status: "failed",
    }
  }
}

function summarizeReconciliationResults(
  accounts: Array<BillingReconciliationAccountResult>
) {
  return {
    accounts,
    checkedAccountCount: accounts.length,
    failedAccountCount: accounts.filter(
      (account) => account.status === "failed"
    ).length,
    syncedQuantityCount: accounts.filter((account) => account.quantitySynced)
      .length,
    syncedSubscriptionCount: accounts.reduce(
      (total, account) => total + account.subscriptionCount,
      0
    ),
  }
}

async function reconcileAllBillingAccounts(): Promise<BillingReconciliationResult> {
  const runId = await createBillingReconciliationRun()

  try {
    const accounts = await listBillingAccountsForReconciliation()
    const accountResults = await Promise.all(
      accounts.map(reconcileBillingAccount)
    )
    const summary = summarizeReconciliationResults(accountResults)

    await updateBillingReconciliationRun({
      runId,
      result: summary,
    })

    return {
      runId,
      ...summary,
    }
  } catch (error) {
    await failBillingReconciliationRun({ runId, error })
    throw error
  }
}

export { reconcileAllBillingAccounts }
export type { BillingReconciliationAccountResult, BillingReconciliationResult }
