import "@tanstack/react-start/server-only"

import { recoveryCounterSchema } from "@/features/account/schemas/password-recovery-schemas"
import { getDatabase } from "@/lib/db"

type RecoveryLimitResult = { allowed: boolean; retryAfter: number }

async function consumeRecoveryLimit(
  keyHash: string,
  max: number,
  windowSeconds: number
): Promise<RecoveryLimitResult> {
  const database = getDatabase()
  // Bounded cleanup; SKIP LOCKED permits independent workers to clean safely.
  await database.query(`
    delete from account_private.password_recovery_limits
    where key_hash in (
      select key_hash from account_private.password_recovery_limits
      where expires_at <= statement_timestamp()
      order by expires_at limit 100 for update skip locked
    ) and expires_at <= statement_timestamp()
  `)
  const result = await database.query(
    `insert into account_private.password_recovery_limits as bucket
       (key_hash, hit_count, expires_at)
     values ($1, 1, statement_timestamp() + $3 * interval '1 second')
     on conflict (key_hash) do update set
       hit_count = case when bucket.expires_at <= statement_timestamp() then 1
         else least(bucket.hit_count + 1, $2 + 1) end,
       expires_at = case when bucket.expires_at <= statement_timestamp()
         then excluded.expires_at else bucket.expires_at end
     returning hit_count <= $2 as allowed,
       greatest(1, ceil(extract(epoch from expires_at - statement_timestamp()))::integer) as retry_after`,
    [keyHash, max, windowSeconds]
  )
  const counter = recoveryCounterSchema.parse(result.rows[0])
  return { allowed: counter.allowed, retryAfter: counter.retry_after }
}

export { consumeRecoveryLimit }
