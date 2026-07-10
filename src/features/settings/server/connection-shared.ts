import "@tanstack/react-start/server-only"

import { getDatabase } from "@/lib/db"

type OrganizationBillingAccountRow = {
  id: string
  stripe_customer_id: string | null
  stripe_payment_method_id: string | null
  payment_method_saved_at: Date | string | null
}

async function getOrCreateOrganizationBillingAccount(input: {
  organizationId: string
  ownerUserId: string
}) {
  const result = await getDatabase().query<OrganizationBillingAccountRow>(
    `with existing_account as (
       select id
       from public.billing_accounts
       where scope = 'organization'
         and organization_id = $1
       limit 1
     ),
     created_account as (
       insert into public.billing_accounts (
         scope,
         organization_id,
         owner_user_id
       )
       select 'organization', $1, $2
       where not exists (select 1 from existing_account)
       returning id
     ),
     chosen_account as (
       select id from existing_account
       union all
       select id from created_account
       limit 1
     )
     select id,
            stripe_customer_id,
            stripe_payment_method_id,
            payment_method_saved_at
     from public.billing_accounts
     where id = (select id from chosen_account)`,
    [input.organizationId, input.ownerUserId],
  )
  const account = result.rows.at(0)

  if (!account) {
    throw new Error("We could not prepare organization billing.")
  }

  return account
}

export { getOrCreateOrganizationBillingAccount }
