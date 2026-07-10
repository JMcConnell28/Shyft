import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import pg from "pg"

const { Client } = pg

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {}
  }

  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=")

        if (separatorIndex === -1) {
          return null
        }

        const key = line.slice(0, separatorIndex).trim()
        const rawValue = line.slice(separatorIndex + 1).trim()
        const value = rawValue.replace(/^["']|["']$/g, "")

        return [key, value]
      })
      .filter(Boolean),
  )
}

function loadEnv() {
  const root = process.cwd()
  const env = {
    ...readEnvFile(path.join(root, ".env")),
    ...readEnvFile(path.join(root, ".env.local")),
    ...process.env,
  }

  return env
}

function parseArgs(argv) {
  const args = {}

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (!arg.startsWith("--")) {
      continue
    }

    const key = arg.slice(2)
    const nextValue = argv[index + 1]

    if (!nextValue || nextValue.startsWith("--")) {
      args[key] = "true"
      continue
    }

    args[key] = nextValue
    index += 1
  }

  return args
}

function printSection(title) {
  console.log("")
  console.log(title)
  console.log("-".repeat(title.length))
}

function printRows(rows) {
  if (rows.length === 0) {
    console.log("No rows.")
    return
  }

  console.table(rows)
}

async function resolveBillingAccountId(client, args) {
  if (args["billing-account-id"]) {
    return args["billing-account-id"]
  }

  if (args["stripe-customer-id"]) {
    const result = await client.query(
      `select id
       from public.billing_accounts
       where stripe_customer_id = $1
       limit 1`,
      [args["stripe-customer-id"]],
    )

    return result.rows.at(0)?.id ?? null
  }

  if (args["location-id"]) {
    const result = await client.query(
      `select billing_account_id as id
       from public.locations
       where id = $1
       limit 1`,
      [args["location-id"]],
    )

    return result.rows.at(0)?.id ?? null
  }

  if (args["location-slug"]) {
    const result = await client.query(
      `select billing_account_id as id
       from public.locations
       where slug = $1
       order by created_at desc
       limit 1`,
      [args["location-slug"]],
    )

    return result.rows.at(0)?.id ?? null
  }

  if (args["organization-id"]) {
    const result = await client.query(
      `select id
       from public.billing_accounts
       where organization_id = $1
       order by created_at desc
       limit 1`,
      [args["organization-id"]],
    )

    return result.rows.at(0)?.id ?? null
  }

  return null
}

async function getBillingAccount(client, billingAccountId) {
  const result = await client.query(
    `select id,
            scope,
            organization_id,
            location_id,
            owner_user_id,
            stripe_customer_id,
            stripe_payment_method_id,
            payment_method_saved_at,
            status,
            created_at,
            updated_at
     from public.billing_accounts
     where id = $1`,
    [billingAccountId],
  )

  return result.rows
}

async function getCoveredLocations(client, billingAccountId) {
  const result = await client.query(
    `select id,
            name,
            slug,
            organization_id,
            created_at
     from public.locations
     where billing_account_id = $1
     order by created_at asc`,
    [billingAccountId],
  )

  return result.rows
}

async function getSubscriptions(client, billingAccountId) {
  const result = await client.query(
    `select stripe_subscription_id,
            stripe_customer_id,
            stripe_price_id,
            status,
            quantity,
            current_period_start,
            current_period_end,
            cancel_at_period_end,
            past_due_started_at,
            created_at,
            updated_at
     from public.billing_subscriptions
     where billing_account_id = $1
     order by created_at desc`,
    [billingAccountId],
  )

  return result.rows
}

async function getTrials(client, billingAccountId) {
  const result = await client.query(
    `select trial.scope,
            trial.organization_id,
            trial.location_id,
            trial.status,
            trial.trial_started_at,
            trial.trial_ends_at,
            trial.updated_at
     from public.workspace_trials trial
     left join public.locations location
       on location.id = trial.location_id
     left join public.billing_accounts location_account
       on location_account.id = location.billing_account_id
     left join public.billing_accounts organization_account
       on organization_account.organization_id = trial.organization_id
     where location_account.id = $1
        or organization_account.id = $1
     order by trial.created_at desc`,
    [billingAccountId],
  )

  return result.rows
}

async function getWebhookEvents(client, args) {
  const eventLimit = Math.min(Number(args.events ?? 10) || 10, 50)
  const billingAccountId = args.billingAccountId ?? null

  if (billingAccountId) {
    const result = await client.query(
      `select stripe_event_id,
              event_type,
              processing_status,
              billing_account_id,
              stripe_customer_id,
              stripe_subscription_id,
              error_message,
              received_at,
              processed_at
       from public.stripe_webhook_events
       where billing_account_id = $1
       order by received_at desc
       limit $2`,
      [billingAccountId, eventLimit],
    )

    return result.rows
  }

  const result = await client.query(
    `select stripe_event_id,
            event_type,
            processing_status,
            billing_account_id,
            stripe_customer_id,
            stripe_subscription_id,
            error_message,
            received_at,
            processed_at
     from public.stripe_webhook_events
     order by received_at desc
     limit $1`,
    [eventLimit],
  )

  return result.rows
}

async function main() {
  const env = loadEnv()
  const args = parseArgs(process.argv.slice(2))
  const databaseUrl = args["database-url"] ?? env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing.")
  }

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    const billingAccountId = await resolveBillingAccountId(client, args)

    if (billingAccountId) {
      args.billingAccountId = billingAccountId
      printSection(`Billing account ${billingAccountId}`)
      printRows(await getBillingAccount(client, billingAccountId))

      printSection("Covered locations")
      printRows(await getCoveredLocations(client, billingAccountId))

      printSection("Subscriptions")
      printRows(await getSubscriptions(client, billingAccountId))

      printSection("Trials")
      printRows(await getTrials(client, billingAccountId))
    } else {
      printSection("Billing account")
      console.log("No billing account filter supplied. Showing recent webhook events only.")
    }

    printSection("Recent Stripe webhook events")
    printRows(await getWebhookEvents(client, args))
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
