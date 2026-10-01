import "@tanstack/react-start/server-only"

import type { AccountPreferences } from "@/features/account/types"
import { accountPreferencesSchema } from "@/features/account/schemas/preference-schemas"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { getDatabase } from "@/lib/db"

async function getAccountPreferences(): Promise<AccountPreferences> {
  const { session } = await requireVerifiedSessionOrThrow()
  const result = await getDatabase().query<{
    announcementPushEnabled: unknown
  }>(
    `select announcement_push_enabled as "announcementPushEnabled"
     from account_private.user_preferences where user_id = $1`,
    [session.user.id]
  )

  return accountPreferencesSchema.parse(
    result.rows[0] ?? { announcementPushEnabled: true }
  )
}

async function updateAccountPreferences(
  input: AccountPreferences
): Promise<AccountPreferences> {
  const { session } = await requireVerifiedSessionOrThrow()
  const preferences = accountPreferencesSchema.parse(input)
  const result = await getDatabase().query<{
    announcementPushEnabled: unknown
  }>(
    `insert into account_private.user_preferences (user_id, announcement_push_enabled)
     values ($1, $2)
     on conflict (user_id) do update
     set announcement_push_enabled = excluded.announcement_push_enabled,
         updated_at = now()
     returning announcement_push_enabled as "announcementPushEnabled"`,
    [session.user.id, preferences.announcementPushEnabled]
  )

  return accountPreferencesSchema.parse(result.rows[0])
}

export { getAccountPreferences, updateAccountPreferences }
