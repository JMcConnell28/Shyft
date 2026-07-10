import "@tanstack/react-start/server-only"

import type Stripe from "stripe"
import { format } from "date-fns"

import {
  sendPaymentFailedEmail,
  sendTrialEndingEmail,
} from "@/features/email/server/billing-emails"
import { buildAppUrl } from "@/lib/app-url.server"
import { getDatabase } from "@/lib/db"

type BillingEmailRecipientRow = {
  billing_account_id: string
  location_slug: string | null
  organization_slug: string | null
  owner_email: string | null
  owner_name: string | null
  workspace_name: string
  workspace_owner_email: string | null
  workspace_owner_name: string | null
}

type BillingEmailRecipient = {
  billingUrl: string
  email: string
  userName: string
  workspaceName: string
}

async function sendPaymentFailedNotification(subscription: Stripe.Subscription) {
  const billingAccountId = subscription.metadata.billingAccountId

  if (!billingAccountId) {
    return { sent: false }
  }

  const recipient = await getBillingEmailRecipient(billingAccountId)

  if (!recipient) {
    return { sent: false }
  }

  await sendPaymentFailedEmail({
    to: recipient.email,
    billingUrl: recipient.billingUrl,
    userName: recipient.userName,
    workspaceName: recipient.workspaceName,
  })

  return { sent: true }
}

async function sendTrialEndingNotification(input: {
  billingAccountId: string
  trialEndsAt: Date | string
}) {
  const recipient = await getBillingEmailRecipient(input.billingAccountId)

  if (!recipient) {
    return { sent: false }
  }

  await sendTrialEndingEmail({
    to: recipient.email,
    billingUrl: recipient.billingUrl,
    trialEndsLabel: format(new Date(input.trialEndsAt), "d MMM yyyy"),
    userName: recipient.userName,
    workspaceName: recipient.workspaceName,
  })

  return { sent: true }
}

async function getBillingEmailRecipient(billingAccountId: string) {
  const result = await getDatabase().query<BillingEmailRecipientRow>(
    `select
       billing_account.id as billing_account_id,
       coalesce(organization.name, location.name, 'your workspace') as workspace_name,
       organization.slug as organization_slug,
       location.slug as location_slug,
       owner_user.name as owner_name,
       owner_user.email as owner_email,
       workspace_owner.name as workspace_owner_name,
       workspace_owner.email as workspace_owner_email
     from public.billing_accounts billing_account
     left join public."organization" organization
       on organization.id = billing_account.organization_id
     left join public.locations location
       on location.id = billing_account.location_id
     left join public."user" owner_user
       on owner_user.id = billing_account.owner_user_id
     left join lateral (
       select account_user.name, account_user.email
       from public."user" account_user
       left join public."member" organization_member
         on organization_member."userId" = account_user.id
        and organization_member."organizationId" = billing_account.organization_id
       left join public.location_memberships location_member
         on location_member.user_id = account_user.id
        and location_member.location_id = billing_account.location_id
       where (
         billing_account.scope = 'organization'
         and organization_member.role in ('owner', 'admin')
       ) or (
         billing_account.scope = 'location'
         and location_member.role in ('owner', 'admin')
       )
       order by
         case
           when organization_member.role = 'owner' then 0
           when location_member.role = 'owner' then 0
           else 1
         end,
         account_user."createdAt" asc
       limit 1
     ) workspace_owner on true
     where billing_account.id = $1
     limit 1`,
    [billingAccountId],
  )
  const row = result.rows.at(0)

  if (!row) {
    return null
  }

  const email = row.owner_email ?? row.workspace_owner_email

  if (!email) {
    return null
  }

  return {
    billingUrl: buildAppUrl(getBillingSettingsPath(row)),
    email,
    userName: row.owner_name ?? row.workspace_owner_name ?? "there",
    workspaceName: row.workspace_name,
  } satisfies BillingEmailRecipient
}

function getBillingSettingsPath(row: BillingEmailRecipientRow) {
  const workspaceSlug = row.organization_slug ?? row.location_slug

  if (!workspaceSlug) {
    return "/dashboard"
  }

  return `/w/${workspaceSlug}/settings/billing`
}

export { sendPaymentFailedNotification, sendTrialEndingNotification }
