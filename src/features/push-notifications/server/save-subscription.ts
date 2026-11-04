import "@tanstack/react-start/server-only"

import type { SavePushSubscriptionInput } from "@/features/push-notifications/types"
import { PUSH_MAX_ACTIVE_SUBSCRIPTIONS } from "@/features/push-notifications/constants/push-limits"
import { savePushSubscriptionSchema } from "@/features/push-notifications/schemas/push-schemas"
import { pushSubscriptionCountSchema } from "@/features/push-notifications/schemas/push-storage-schemas"
import { getDatabase } from "@/lib/db"

async function upsertPushSubscription(
  input: SavePushSubscriptionInput & {
    userAgent?: string
    userId: string
  }
): Promise<void> {
  const safeInput = savePushSubscriptionSchema.parse(input)
  const client = await getDatabase().connect()
  try {
    await client.query("begin isolation level read committed")
    await client.query("set local lock_timeout = '5s'")
    // Serialize registrations across app instances. Count only after acquiring
    // the lock, in a fresh statement, so concurrent saves cannot exceed the cap.
    await client.query(
      "select pg_advisory_xact_lock(hashtextextended('push-subscriptions:' || $1, 0))",
      [input.userId]
    )
    const count = await client.query(
      `select count(*)::integer as active_count
       from push_private.push_subscriptions
       where user_id = $1 and revoked_at is null and endpoint <> $2`,
      [input.userId, safeInput.subscription.endpoint]
    )
    const { active_count: activeCount } = pushSubscriptionCountSchema.parse(
      count.rows.at(0)
    )
    if (activeCount >= PUSH_MAX_ACTIVE_SUBSCRIPTIONS) {
      throw new Error(
        "The notification device limit has been reached. Disable notifications on an old device first."
      )
    }

    const result = await client.query(
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
        safeInput.subscription.endpoint,
        safeInput.subscription.keys.p256dh,
        safeInput.subscription.keys.auth,
        safeInput.deviceDescription ?? null,
        input.userAgent?.slice(0, 1024) ?? null,
        safeInput.platform ?? null,
      ]
    )
    if (result.rowCount !== 1) {
      throw new Error("That browser subscription belongs to another account.")
    }
    await client.query("commit")
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

export { upsertPushSubscription }
