import "@tanstack/react-start/server-only"

import type {
  PushSubscriptionInput,
  PushSubscriptionState,
} from "@/features/push-notifications/types"
import { getDatabase } from "@/lib/db"

type PushSubscriptionRow = {
  auth_key: string
  endpoint: string
  id: string
  p256dh_key: string
  updated_at: Date | string
  user_id: string
}

async function upsertPushSubscription(input: {
  deviceDescription?: string
  platform?: string
  subscription: PushSubscriptionInput
  userAgent?: string
  userId: string
}) {
  const result = await getDatabase().query(
    `insert into push_private.push_subscriptions (
       user_id, endpoint, p256dh_key, auth_key, device_description,
       user_agent, platform, revoked_at, updated_at
     ) values ($1, $2, $3, $4, $5, $6, $7, null, timezone('utc', now()))
     on conflict (endpoint) do update
       set user_id = excluded.user_id,
           p256dh_key = excluded.p256dh_key,
           auth_key = excluded.auth_key,
           device_description = excluded.device_description,
           user_agent = excluded.user_agent,
           platform = excluded.platform,
           revoked_at = null,
           updated_at = timezone('utc', now())
       where push_subscriptions.user_id = excluded.user_id
     returning id`,
    [
      input.userId,
      input.subscription.endpoint,
      input.subscription.keys.p256dh,
      input.subscription.keys.auth,
      input.deviceDescription ?? null,
      input.userAgent?.slice(0, 1024) ?? null,
      input.platform ?? null,
    ]
  )

  if (result.rowCount !== 1) {
    throw new Error("That browser subscription belongs to another account.")
  }
}

async function revokePushSubscription(input: {
  endpoint: string
  userId: string
}) {
  await getDatabase().query(
    `update push_private.push_subscriptions
     set revoked_at = timezone('utc', now()),
         updated_at = timezone('utc', now())
     where endpoint = $1 and user_id = $2`,
    [input.endpoint, input.userId]
  )
}

async function getPushSubscriptionState(input: {
  endpoint?: string
  userId: string
}): Promise<PushSubscriptionState> {
  const result = await getDatabase().query<PushSubscriptionRow>(
    `select id, user_id, endpoint, p256dh_key, auth_key, updated_at
     from push_private.push_subscriptions
     where user_id = $1
       and ($2::text is null or endpoint = $2)
       and revoked_at is null
     order by updated_at desc
     limit 1`,
    [input.userId, input.endpoint ?? null]
  )
  const row = result.rows.at(0)

  return {
    active: Boolean(row),
    endpoint: row?.endpoint ?? null,
    updatedAt: row ? new Date(row.updated_at).toISOString() : null,
  }
}

async function listActivePushSubscriptionsForUsers(userIds: Array<string>) {
  if (userIds.length === 0) {
    return []
  }

  const result = await getDatabase().query<PushSubscriptionRow>(
    `select distinct on (endpoint)
       id, user_id, endpoint, p256dh_key, auth_key, updated_at
     from push_private.push_subscriptions
     where user_id = any($1::text[]) and revoked_at is null
     order by endpoint, updated_at desc`,
    [userIds]
  )

  return result.rows
}

async function markPushSubscriptionUsed(id: string) {
  await getDatabase().query(
    `update push_private.push_subscriptions
     set last_used_at = timezone('utc', now())
     where id = $1`,
    [id]
  )
}

async function revokePushSubscriptionById(id: string) {
  await getDatabase().query(
    `update push_private.push_subscriptions
     set revoked_at = timezone('utc', now()), updated_at = timezone('utc', now())
     where id = $1`,
    [id]
  )
}

export {
  getPushSubscriptionState,
  listActivePushSubscriptionsForUsers,
  markPushSubscriptionUsed,
  revokePushSubscription,
  revokePushSubscriptionById,
  upsertPushSubscription,
}
export type { PushSubscriptionRow }
